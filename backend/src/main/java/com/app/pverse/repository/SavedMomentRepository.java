package com.app.pverse.repository;

import com.app.pverse.entity.SavedMoment;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedMomentRepository extends JpaRepository<SavedMoment, Long> {

    /**
     * Lấy saved moments của một user (phân trang với Slice)
     */
    Slice<SavedMoment> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    /**
     * Kiểm tra xem user đã save moment này chưa
     */
    boolean existsByUserIdAndMomentId(Long userId, Long momentId);

    /**
     * Xóa saved moment của user cho một moment cụ thể
     */
    void deleteByUserIdAndMomentId(Long userId, Long momentId);

    /**
     * Lấy tất cả saved moments của user (không phân trang, cho count hoặc list)
     */
    List<SavedMoment> findByUserId(Long userId);
}
