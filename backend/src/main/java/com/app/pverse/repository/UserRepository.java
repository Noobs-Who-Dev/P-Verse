package com.app.pverse.repository;

import com.app.pverse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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
     * Tìm user theo username hoặc email (dùng cho login)
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
}

