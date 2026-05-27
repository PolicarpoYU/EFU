# EFU (Emoji Fácil Ulianov) Semantic Keyboard Standard Draft

Version: Draft 0.1  
Author: Dr. Policarpo Yoshin Ulianov  
Status: Public Draft Specification  
Compatibility: Unicode Emoji Standard  
Repository: https://github.com/PolicarpoYU/EFU

---

# 1. Introduction

The EFU (Emoji Fácil Ulianov) Semantic Keyboard Standard defines a hierarchical semantic organization model for Unicode emojis optimized for fast human navigation, intuitive semantic access, and pictographic communication systems.

Unlike traditional emoji keyboards based on sequential scrolling lists, the EFU model organizes emojis into semantic categories accessed through a two-step hierarchical structure.

The standard aims to:

- reduce visual search complexity;
- improve emoji navigation efficiency;
- preserve compatibility with Unicode emojis;
- support semantic and pictographic communication systems;
- provide a stable semantic indexing structure for software implementations.

---

# 2. Scope

This document specifies:

- EFU semantic keyboard architecture;
- category organization rules;
- BEG group definitions;
- emoji positioning rules;
- semantic navigation principles;
- Unicode compatibility requirements;
- future expansion guidelines.

This specification does not modify Unicode itself.  
The EFU system operates as a semantic organizational layer built on top of the existing Unicode emoji standard.

---

# 3. Terminology

| Term | Definition |
|---|---|
| EFU | Emoji Fácil Ulianov |
| BEG | Basic Emoji Group |
| Main Keyboard | First-level semantic category keyboard |
| Secondary Keyboard | Emoji selection keyboard opened from a category |
| Semantic Category | Group of semantically related emojis |
| Semantic Navigation | Emoji selection based on conceptual association |
| Unicode Emoji | Official emoji defined by the Unicode Consortium |

---

# 4. General Architecture

The EFU model uses a hierarchical two-step activation mechanism.

## Step 1

The user selects a semantic category represented by a main emoji.

## Step 2

The system opens a secondary keyboard containing semantically related emojis.

Thus, any emoji may be accessed using only two selection actions.

---

# 5. Keyboard Structure

The EFU system uses two principal keyboard pages.

Each page contains:

- 5 rows;
- 7 columns;
- 35 visual positions.

Therefore:

```text
2 × 35 = 70 semantic categories
