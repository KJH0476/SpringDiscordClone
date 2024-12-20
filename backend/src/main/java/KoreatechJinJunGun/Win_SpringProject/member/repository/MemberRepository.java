package KoreatechJinJunGun.Win_SpringProject.member.repository;

import KoreatechJinJunGun.Win_SpringProject.member.entity.Member;
import KoreatechJinJunGun.Win_SpringProject.member.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByEmail(String email);
    Optional<Member> findByUsername(String string);

    @Modifying
    @Query("UPDATE Member m SET m.status = :status WHERE m.id = :id")
    void updateStatusByEmail(@Param("status") Status status, @Param("id") Long memberId);
}
