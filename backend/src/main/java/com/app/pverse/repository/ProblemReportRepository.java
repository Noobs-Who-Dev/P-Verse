package com.app.pverse.repository;

import com.app.pverse.entity.ProblemReport;
import com.app.pverse.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProblemReportRepository extends JpaRepository<ProblemReport, Long> {

    List<ProblemReport> findByUserOrderByCreatedAtDesc(User user);

    List<ProblemReport> findByStatusOrderByCreatedAtDesc(String status);

    long countByUserAndStatus(User user, String status);
}

