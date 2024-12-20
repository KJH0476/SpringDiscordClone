package KoreatechJinJunGun.Win_SpringProject.friend.repository;

import KoreatechJinJunGun.Win_SpringProject.friend.entity.Friend;
import KoreatechJinJunGun.Win_SpringProject.friend.entity.FriendRelation;
import KoreatechJinJunGun.Win_SpringProject.member.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface FriendRepository extends JpaRepository<Friend, Long> {

    List<Friend> findByMemberAndRelationStatus(Member member, FriendRelation relationStatus);

    Optional<Friend> findByMemberAndFriendMember(Member member, Member friendMember);

    //친구 서로 삭제
    @Modifying
    void deleteByMemberAndFriendMember(Member member, Member friendMember);

    //서로 친구관계로 update
    @Modifying
    @Query("UPDATE Friend f SET f.relationStatus = :relationStatus, f.relationDate = :relationDate WHERE f.member = :member AND f.friendMember = :friendMember")
    void updateFriendRelation(@Param("relationStatus") FriendRelation relationStatus, @Param("relationDate") Date relationDate,
                              @Param("member") Member member, @Param("friendMember") Member friendMember);

}
