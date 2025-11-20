package com.app.pverse.repository;

import com.app.pverse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Tìm user theo username
     */
    Optional<User> findByUsername(String username);

    /**
     * Tìm user theo email
     */
    Optional<User> findByEmail(String email);

    /**
     * Kiểm tra username đã tồn tại chưa
     */
    boolean existsByUsername(String username);

    /**
     * Kiểm tra email đã tồn tại chưa
     */
    boolean existsByEmail(String email);

    /**
     * Tìm user theo username hoặc email
     */
    @Query("SELECT u FROM User u WHERE u.username = :credential OR u.email = :credential")
    Optional<User> findByUsernameOrEmail(@Param("credential") String credential);

    /**
     * Cập nhật trạng thái online
     */
    @Modifying
    @Query("UPDATE User u SET u.isOnline = :isOnline, u.lastSeenAt = :lastSeenAt WHERE u.id = :userId")
    void updateOnlineStatus(@Param("userId") Long userId,
                            @Param("isOnline") Boolean isOnline,
                            @Param("lastSeenAt") LocalDateTime lastSeenAt);

    /**
     * Tìm kiếm users theo username, display_name hoặc email
     * Loại trừ bản thân và những người đã block
     * Empty keyword returns all users (for suggestions)
     */
    @Query(value = """
        SELECT DISTINCT u.* FROM users u
        WHERE u.id != :viewerId
        AND (
            :keyword = '' OR
            LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
            LOWER(u.display_name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
            LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        AND NOT EXISTS (
            SELECT 1 FROM blocked_users b
            WHERE (b.blocker_id = :viewerId AND b.blocked_id = u.id)
               OR (b.blocker_id = u.id AND b.blocked_id = :viewerId)
        )
        ORDER BY u.username
        LIMIT :limit
        """, nativeQuery = true)
    List<User> searchUsers(@Param("keyword") String keyword,
                           @Param("viewerId") Long viewerId,
                           @Param("limit") int limit);
}