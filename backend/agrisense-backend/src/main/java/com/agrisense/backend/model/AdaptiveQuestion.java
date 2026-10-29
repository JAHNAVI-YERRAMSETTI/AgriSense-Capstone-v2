package com.agrisense.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "adaptive_questions")
public class AdaptiveQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String questionText;

    @Column(nullable = false)
    private String questionType;

    private String category;

    private String relatedField;

    private String triggerCondition;

    private Boolean active;

    public AdaptiveQuestion() {
    }

    public AdaptiveQuestion(
            String questionText,
            String questionType,
            String category,
            String relatedField,
            String triggerCondition,
            Boolean active
    ) {
        this.questionText = questionText;
        this.questionType = questionType;
        this.category = category;
        this.relatedField = relatedField;
        this.triggerCondition = triggerCondition;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getQuestionType() {
        return questionType;
    }

    public void setQuestionType(String questionType) {
        this.questionType = questionType;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getRelatedField() {
        return relatedField;
    }

    public void setRelatedField(String relatedField) {
        this.relatedField = relatedField;
    }

    public String getTriggerCondition() {
        return triggerCondition;
    }

    public void setTriggerCondition(String triggerCondition) {
        this.triggerCondition = triggerCondition;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}