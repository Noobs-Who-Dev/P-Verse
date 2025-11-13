package com.app.pverse.repository;

import com.app.pverse.entity.MomentReaction;
import com.app.pverse.entity.MomentReaction.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MomentReactionRepository extends JpaRepository<MomentReaction, Long> {

    /**
     * Tìm reaction của user trên moment
     */
    Optional<MomentReaction> findByMomentIdAndUserId(Long momentId, Long userId);

    /**
     * Lấy tất cả reactions của một moment
     */
    List<MomentReaction> findByMomentIdOrderByCreatedAtDesc(Long momentId);

    /**
     * Lấy reactions của một moment theo loại
     */
    List<MomentReaction> findByMomentIdAndReactionType(Long momentId, ReactionType reactionType);

    /**
     * Đếm số reactions của moment
     */
    long countByMomentId(Long momentId);

    /**
     * Đếm số reactions theo loại của moment
     */
    long countByMomentIdAndReactionType(Long momentId, ReactionType reactionType);

    /**
     * Kiểm tra user đã react moment chưa
     * EXISTS query - fastest cho boolean check
     */
    boolean existsByMomentIdAndUserId(Long momentId, Long userId);

    /**
     * Xóa reaction của user trên moment
     * Phải wrap trong @Transactional ở Service layer
     */
    void deleteByMomentIdAndUserId(Long momentId, Long userId);

    /**
     * Đếm số lượng từng loại reaction của moment
     * Return Object[] = [ReactionType, Long count]
     */
    @Query("SELECT r.reactionType, COUNT(r) FROM MomentReaction r " +
            "WHERE r.moment.id = :momentId " +
            "GROUP BY r.reactionType")
    List<Object[]> countReactionsByType(@Param("momentId") Long momentId);
}