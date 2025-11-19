package com.app.pverse.repository;

import com.app.pverse.entity.Moment;
import com.app.pverse.entity.Moment.Visibility;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MomentRepository extends JpaRepository<Moment, Long> {

    /**
     * Lấy moments của một user (phân trang với Slice - không COUNT)
     */
    Slice<Moment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Lấy moments của user với visibility cụ thể
     */
    Slice<Moment> findByUserIdAndVisibilityOrderByCreatedAtDesc(
            Long userId,
            Visibility visibility,
            Pageable pageable
    );

    /**
     * Lấy feed moments - Optimized query
     * Bao gồm:
     * - Moments của friends với visibility = ALL_FRIENDS
     * - Moments được share riêng cho user (SPECIFIC_PERSON)
     * - Moments của chính user (all visibilities)
     */
    @Query("SELECT DISTINCT m FROM Moment m " +
            "WHERE (m.visibility = 'ALL_FRIENDS' AND m.user.id IN :friendIds) " +
            "OR (m.visibility = 'SPECIFIC_PERSON' AND m.specificUser.id = :currentUserId) " +
            "OR (m.user.id = :currentUserId) " +
            "ORDER BY m.createdAt DESC, m.id DESC")
    Slice<Moment> findFeedMoments(
            @Param("friendIds") List<Long> friendIds,
            @Param("currentUserId") Long currentUserId,
            Pageable pageable
    );

    /**
     * Lấy moments của friends only (exclude own moments)
     * Used for "Friends" tab filter
     */
    @Query("SELECT DISTINCT m FROM Moment m " +
            "WHERE m.visibility = 'ALL_FRIENDS' " +
            "AND m.user.id IN :friendIds " +
            "AND m.user.id != :currentUserId " +
            "ORDER BY m.createdAt DESC, m.id DESC")
    Slice<Moment> findFriendsMoments(
            @Param("friendIds") List<Long> friendIds,
            @Param("currentUserId") Long currentUserId,
            Pageable pageable
    );

    /**
     * Lấy moments được share riêng cho user (SPECIFIC_PERSON)
     */
    Slice<Moment> findByVisibilityAndSpecificUserIdOrderByCreatedAtDesc(
            Visibility visibility,
            Long specificUserId,
            Pageable pageable
    );

    /**
     * Đếm số moments của user
     */
    long countByUserId(Long userId);

    /**
     * Đếm số moments của user với visibility cụ thể
     */
    long countByUserIdAndVisibility(Long userId, Visibility visibility);

    /**
     * Lấy moments mới nhất của user (cho profile preview)
     */
    List<Moment> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);

    /**
     * Kiểm tra user có quyền xem moment không
     */
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Moment m " +
            "WHERE m.id = :momentId " +
            "AND (m.user.id = :userId " +
            "OR m.visibility = 'ALL_FRIENDS' " +
            "OR (m.visibility = 'SPECIFIC_PERSON' AND m.specificUser.id = :userId))")
    boolean canUserViewMoment(@Param("momentId") Long momentId, @Param("userId") Long userId);

    /**
     * CURSOR-BASED PAGINATION
     * Lấy feed moments với cursor (createdAt, id)
     * Cursor format: "timestamp_momentId"
     */
    @Query("SELECT DISTINCT m FROM Moment m " +
            "WHERE ((m.visibility = 'ALL_FRIENDS' AND m.user.id IN :friendIds) " +
            "OR (m.visibility = 'SPECIFIC_PERSON' AND m.specificUser.id = :currentUserId) " +
            "OR (m.user.id = :currentUserId)) " +
            "AND (m.createdAt < :cursorTime OR (m.createdAt = :cursorTime AND m.id < :cursorId)) " +
            "ORDER BY m.createdAt DESC, m.id DESC")
    List<Moment> findFeedMomentsWithCursor(
            @Param("friendIds") List<Long> friendIds,
            @Param("currentUserId") Long currentUserId,
            @Param("cursorTime") java.time.LocalDateTime cursorTime,
            @Param("cursorId") Long cursorId,
            Pageable pageable
    );

    /**
     * Initial feed query (no cursor) for cursor-based pagination
     */
    @Query("SELECT DISTINCT m FROM Moment m " +
            "WHERE (m.visibility = 'ALL_FRIENDS' AND m.user.id IN :friendIds) " +
            "OR (m.visibility = 'SPECIFIC_PERSON' AND m.specificUser.id = :currentUserId) " +
            "OR (m.user.id = :currentUserId) " +
            "ORDER BY m.createdAt DESC, m.id DESC")
    List<Moment> findFeedMomentsInitial(
            @Param("friendIds") List<Long> friendIds,
            @Param("currentUserId") Long currentUserId,
            Pageable pageable
    );
}