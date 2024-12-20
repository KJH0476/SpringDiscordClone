package KoreatechJinJunGun.Win_SpringProject.friend.service;

import KoreatechJinJunGun.Win_SpringProject.friend.entity.FriendDto;
import KoreatechJinJunGun.Win_SpringProject.friend.entity.FriendForm;
import KoreatechJinJunGun.Win_SpringProject.friend.entity.FriendRelation;
import KoreatechJinJunGun.Win_SpringProject.friend.repository.FriendRepository;
import KoreatechJinJunGun.Win_SpringProject.friend.entity.Friend;
import KoreatechJinJunGun.Win_SpringProject.member.entity.Member;
import KoreatechJinJunGun.Win_SpringProject.member.entity.Status;
import KoreatechJinJunGun.Win_SpringProject.member.repository.MemberRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepository friendRepository;
    private final MemberRepository memberRepository;

    //전체 친구, 받은 요청, 보낸 요청 조회
    public List<FriendDto> findFriend(Long memberId, FriendRelation relationStatus){
        return memberRepository.findById(memberId)
                .map(member -> friendRepository.findByMemberAndRelationStatus(member, relationStatus)
                        .stream().map(this::convertToDto)
                        .collect(Collectors.toList()))
                .orElseGet(Collections::emptyList); // 불변한 빈 리스트 반환
    }

    //온라인인 친구 반환
    public List<FriendDto> findOnlineFriend(Long memberId, FriendRelation relationStatus){
        List<FriendDto> onlineFriend = new ArrayList<>();
        List<FriendDto> friends = findFriend(memberId, relationStatus);
        for (FriendDto friend : friends) {
            if(friend.getFriendStatus().equals(Status.ONLINE)) onlineFriend.add(friend);
        }
        return onlineFriend;
    }

    public String requestFriend(FriendForm friendForm) {
        Member member = memberRepository.findByUsername(friendForm.getMemberName())
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));

        Member friendMember = memberRepository.findByUsername(friendForm.getFriendName())
                .orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));

        //이미 친구 요청을 했는지 확인
        friendRepository.findByMemberAndFriendMember(member, friendMember)
                .ifPresent(friend -> {throw new NoSuchElementException("이미 요청을 보내거나 받은 사용자입니다.");});

        createAndSaveFriend(friendMember, member, FriendRelation.RECEIVED);
        createAndSaveFriend(member, friendMember, FriendRelation.REQUESTED);

        //알림을 위해 요청을 받을 친구의 이메일 반환
        return friendMember.getEmail();
    }

    private void createAndSaveFriend(Member member, Member friendMember, FriendRelation relationType) {
        Friend friend = Friend.builder()
                .member(member)
                .friendMember(friendMember)
                .relationStatus(relationType)
                .applyTime(new Date(System.currentTimeMillis()))
                .build();
        friendRepository.save(friend);
    }

    public Member receivedFriend(String memberName, String friendName){
        Date date = new Date(System.currentTimeMillis());
        Member member = memberRepository.findByUsername(memberName).orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
        Member friendMember = memberRepository.findByUsername(friendName).orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
        friendRepository.updateFriendRelation(FriendRelation.FRIENDS, date, member, friendMember);
        friendRepository.updateFriendRelation(FriendRelation.FRIENDS, date, friendMember, member);

        return friendMember;
    }

    public Member removeEachFriend(String memberName, String friendName){
        Member member = memberRepository.findByUsername(memberName).orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
        Member friendMember = memberRepository.findByUsername(friendName).orElseThrow(() -> new NoSuchElementException("사용자를 찾을 수 없습니다."));
        friendRepository.deleteByMemberAndFriendMember(member, friendMember);
        friendRepository.deleteByMemberAndFriendMember(friendMember, member);

        return friendMember;
    }

    private FriendDto convertToDto(Friend friend) {
        return FriendDto.builder()
                .id(friend.getId())
                .memberUsername(friend.getMember().getUsername())
                .friendMemberId(friend.getFriendMember().getId())
                .friendName(friend.getFriendMember().getUsername())
                .friendEmail(friend.getFriendMember().getEmail())
                .friendStatus(friend.getFriendMember().getStatus())
                .relation(friend.getRelationStatus())
                .applyTime(friend.getApplyTime())
                .build();
    }
}
