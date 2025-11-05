package com.app.pverse.repository;

import com.app.pverse.entity.MomentContext;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MomentContextRepository extends JpaRepository<MomentContext, Long> {

    /**
     * Tìm context theo moment ID
     */
    Optional<MomentContext> findByMomentId(Long momentId);

    /**
     * Kiểm tra moment đã có context chưa
     */
    boolean existsByMomentId(Long momentId);

    /**
     * Xóa context của moment
     */
    void deleteByMomentId(Long momentId);
}

