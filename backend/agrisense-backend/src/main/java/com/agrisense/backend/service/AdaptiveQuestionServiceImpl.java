package com.agrisense.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.agrisense.backend.model.AdaptiveQuestion;
import com.agrisense.backend.repository.AdaptiveQuestionRepository;

@Service
public class AdaptiveQuestionServiceImpl
        implements AdaptiveQuestionService {

    private final AdaptiveQuestionRepository
            adaptiveQuestionRepository;

    public AdaptiveQuestionServiceImpl(
            AdaptiveQuestionRepository adaptiveQuestionRepository
    ) {
        this.adaptiveQuestionRepository =
                adaptiveQuestionRepository;
    }

    @Override
    public AdaptiveQuestion addQuestion(
            AdaptiveQuestion question
    ) {
        return adaptiveQuestionRepository.save(question);
    }

    @Override
    public List<AdaptiveQuestion> getAllActiveQuestions() {
        return adaptiveQuestionRepository
                .findByActiveTrue();
    }

    @Override
    public AdaptiveQuestion getQuestionById(Long id) {
        return adaptiveQuestionRepository
                .findById(id)
                .orElse(null);
    }

    @Override
    public List<AdaptiveQuestion> getQuestionsByField(
            String relatedField
    ) {
        return adaptiveQuestionRepository
                .findByActiveTrueAndRelatedField(
                        relatedField
                );
    }

    @Override
    public List<AdaptiveQuestion> getQuestionsByCategory(
            String category
    ) {
        return adaptiveQuestionRepository
                .findByActiveTrueAndCategory(
                        category
                );
    }
}