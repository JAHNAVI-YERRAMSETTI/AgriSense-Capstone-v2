package com.agrisense.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.agrisense.backend.model.AdaptiveQuestion;

public interface AdaptiveQuestionRepository
        extends JpaRepository<AdaptiveQuestion, Long> {

    List<AdaptiveQuestion> findByActiveTrue();

    List<AdaptiveQuestion> findByActiveTrueAndRelatedField(
            String relatedField
    );

    List<AdaptiveQuestion> findByActiveTrueAndCategory(
            String category
    );
}