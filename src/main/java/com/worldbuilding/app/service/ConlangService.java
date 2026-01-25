package com.worldbuilding.app.service;

import com.worldbuilding.app.model.Conlang;
import com.worldbuilding.app.model.MorphRule;
import com.worldbuilding.app.model.Palabra;
import com.worldbuilding.app.utils.VectorizationUtils;
import edu.mit.jwi.Dictionary;
import edu.mit.jwi.IDictionary;
import edu.mit.jwi.item.IIndexWord;
import edu.mit.jwi.item.ISynset;
import edu.mit.jwi.item.IWord;
import edu.mit.jwi.item.POS;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ConlangService {

    private IDictionary wordnetDict;

    private static final Logger logger = LoggerFactory.getLogger(ConlangService.class);

    public ConlangService() {
        // Initialize WordNet
        try {
            // Placeholder: Point to a real path in a real env, or use a bundled resource
            String path = "data/wordnet/dict";
            java.io.File dictFile = new java.io.File(path);
            if (dictFile.exists()) {
                URL url = dictFile.toURI().toURL();
                wordnetDict = new Dictionary(url);
                wordnetDict.open();
            } else {
                logger.warn(">>> [ConlangService] WordNet Dictionary not found at '{}'. Semantic features disabled.",
                        path);
            }
        } catch (Exception e) {
            logger.error(">>> [ConlangService] Error initializing WordNet: {}", e.getMessage());
        }
    }

    /**
     * Deconstructs a phrase into semantic concepts using direct lookup (simplified
     * NLP).
     */
    public List<String> getSemanticConcepts(String input) {
        List<String> concepts = new ArrayList<>();
        if (wordnetDict == null || !wordnetDict.isOpen()) {
            // Fallback: tokenize
            String[] tokens = input.split("\\s+");
            for (String t : tokens)
                concepts.add(t.toUpperCase());
            return concepts;
        }

        // Simple lookup logic
        String[] words = input.split("\\s+");
        for (String w : words) {
            IIndexWord idxWord = wordnetDict.getIndexWord(w, POS.NOUN); // Try Noun first
            if (idxWord != null) {
                concepts.add(idxWord.getWordIDs().get(0).getLemma());
            } else {
                concepts.add(w.toUpperCase());
            }
        }
        return concepts;
    }

    /**
     * Applies morphological rules to a base root.
     */
    public String applyMorphology(String root, List<MorphRule> rules) {
        String result = root;
        // Rules should be ordered by priority in the query
        for (MorphRule rule : rules) {
            Pattern p = Pattern.compile(rule.getRegexPattern());
            Matcher m = p.matcher(result);
            if (m.find()) {
                result = m.replaceAll(rule.getReplacementPattern());
            }
        }
        return result;
    }
}
