package com.worldbuilding.app.model;

import jakarta.persistence.*;

@Entity
@Table(name = "conlang_rules")
public class MorphRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String ruleName; // e.g., "Pluralization"

    @Column(name = "regex_pattern", nullable = false)
    private String regexPattern; // Input pattern

    @Column(name = "replacement_pattern", nullable = false)
    private String replacementPattern; // Output pattern

    @Column(nullable = false)
    private int priority; // Order of application

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conlang_id") // Changed from project_id to conlang_id to link to Conlang directly
    private Conlang conlang;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public String getRegexPattern() {
        return regexPattern;
    }

    public void setRegexPattern(String regexPattern) {
        this.regexPattern = regexPattern;
    }

    public String getReplacementPattern() {
        return replacementPattern;
    }

    public void setReplacementPattern(String replacementPattern) {
        this.replacementPattern = replacementPattern;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public Conlang getConlang() {
        return conlang;
    }

    public void setConlang(Conlang conlang) {
        this.conlang = conlang;
    }
}
