package com.app.pverse.repository;

import com.app.pverse.entity.Moment;
import com.app.pverse.entity.Moment.Visibility;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MomentRepository extends JpaRepository<Moment, Long> {

    /**
     * Lấy moments của một user (phân trang)
     */
    Page<Moment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Lấy moments của user với visibility cụ thể
     */
    Page<Moment> findByUserIdAndVisibilityOrderByCreatedAtDesc(
        Long userId,
        Visibility visibility,
        Pageable pageable
    );

    /**
     * Lấy feed moments từ danh sách bạn bè
     * (chỉ lấy moments có visibility = ALL_FRIENDS)
     */
    @Query("SELECT m FROM Moment m " +
           "WHERE m.user.id IN :friendIds " +
           "AND m.visibility = 'ALL_FRIENDS' " +
           "ORDER BY m.createdAt DESC")
    Page<Moment> findFeedMoments(@Param("friendIds") List<Long> friendIds, Pageable pageable);

    /**
     * Lấy feed moments từ danh sách bạn bè (bao gồm cả moments của user hiện tại)
     */
    @Query("SELECT m FROM Moment m " +
           "WHERE (m.user.id IN :friendIds OR m.user.id = :currentUserId) " +
           "AND (m.visibility = 'ALL_FRIENDS' OR m.user.id = :currentUserId) " +
           "ORDER BY m.createdAt DESC")
    Page<Moment> findFeedMomentsIncludingSelf(
        @Param("friendIds") List<Long> friendIds,
        @Param("currentUserId") Long currentUserId,
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
     * Lấy moments mới nhất của user
     */
    List<Moment> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}

