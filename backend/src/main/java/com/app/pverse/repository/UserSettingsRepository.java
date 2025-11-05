package com.app.pverse.repository;

import com.app.pverse.entity.UserSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserSettingsRepository extends JpaRepository<UserSettings, Long> {

    /**
     * Tìm settings theo user ID
     */
    Optional<UserSettings> findByUserId(Long userId);

    /**
     * Kiểm tra user đã có settings chưa
     */
    boolean existsByUserId(Long userId);
}

