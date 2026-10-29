package com.agrisense.backend.service;

import java.util.List;

import com.agrisense.backend.model.AdaptiveQuestion;

public interface AdaptiveQuestionService {

    AdaptiveQuestion addQuestion(
            AdaptiveQuestion question
    );

    List<AdaptiveQuestion> getAllActiveQuestions();

    AdaptiveQuestion getQuestionById(Long id);

    List<AdaptiveQuestion> getQuestionsByField(
            String relatedField
    );

    List<AdaptiveQuestion> getQuestionsByCategory(
            String category
    );
}