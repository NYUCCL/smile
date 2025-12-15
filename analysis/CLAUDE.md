# Claude Agent Guide: Smile Data Analysis

This guide helps Claude agents write effective Python code for analyzing Smile experiment data using the `smiledata` library, Polars, and seaborn/matplotlib.

## Environment Setup

The analysis environment uses `uv` for package management. Always run Python code from the `analysis/` directory:

```bash
cd analysis
uv run python script.py
uv run jupyter lab
uv run marimo edit notebook.py
```

## Using the smiledata Library

### Loading Data

```python
from smiledata import load_json, load_folder, load_latest

# Load a specific file
data = load_json("data/experiment-2025-01-15.json")

# Load all JSON files from a folder
data = load_folder("data/")

# Load the most recently modified file
data = load_latest("data/")
```

### Filtering Participants

```python
# Get only complete participants (consented, done, not withdrawn)
complete = data.complete_only()

# Filter by experimental condition
condition_a = data.by_condition(condition="A")

# Filter by multiple conditions
filtered = data.by_condition(condition="A", block_order="1")

# Custom filter with lambda
fast = data.filter(lambda p: p.trial_count > 50)

# Chain filters
result = data.complete_only().by_condition(condition="A")
```

### Converting to DataFrames

```python
# See available pages in the data
print(data.available_pages())  # e.g., ['demograph', 'device', 'feedback', 'mental_rotation_exp', 'quiz']

# Trial-level data for a specific page (route-based recording)
trials_df = data.to_trials_df(page="mental_rotation_exp")

# If using legacy studyData (deprecated), omit the page argument
trials_df = data.to_trials_df()  # Raises helpful error if studyData is empty

# Participant-level data (one row per participant)
participants_df = data.to_participants_df()

# Demographics
demographics_df = data.demographics_df()

# Specific page data
quiz_df = data.to_page_data_df("quiz")
```

The resulting DataFrame from `to_page_data_df()` or `to_trials_df(page=...)` includes automatic columns:

- `participant_id`: Firebase document ID
- `visit`: Visit number (0-indexed) if participant visited the page multiple times
- `index`: Index of entry within the visit
- `timestamp`: When data was recorded (if available)

Plus all fields recorded in each data entry.

### Data Organization Requirements

For `to_page_data_df()` and `to_trials_df(page=...)` to produce clean DataFrames, the data recorded must be organized consistently:

**Consistent field names** - Each data entry should have the same field names across all entries and participants:

```javascript
// Good: Consistent field names
recordPageData({ trial_num: 1, stimulus: 'A', response: 'left', rt: 523 })
recordPageData({ trial_num: 2, stimulus: 'B', response: 'right', rt: 612 })

// Bad: Inconsistent names create sparse columns
recordPageData({ trialNumber: 1, stim: 'A', response: 'left', reactionTime: 523 })
recordPageData({ trial_num: 2, stimulus: 'B', response: 'right', rt: 612 })
```

**Consistent data types** - Keep types consistent for each field:

```javascript
// Good: rt is always a number
recordPageData({ rt: 523 })
recordPageData({ rt: null, status: 'timeout' }) // Use null for missing values

// Bad: Mixed types cause issues
recordPageData({ rt: 523 })
recordPageData({ rt: 'timeout' })
```

**Flat structure preferred** - Keep entries flat for easy DataFrame conversion:

```javascript
// Good: Flat
recordPageData({ trial_num: 1, stimulus_type: 'congruent', rt: 523 })

// Avoid: Deeply nested
recordPageData({ trial: { num: 1, stimulus: { type: 'congruent' } }, response: { rt: 523 } })
```

If you have nested data, use `flatten_nested()`:

```python
from smiledata.transforms import flatten_nested
flat = flatten_nested({"a": {"b": 1, "c": 2}})
# Result: {"a.b": 1, "a.c": 2}
```

### Accessing Individual Participants

```python
participant = data[0]

# Key properties
participant.id              # Firebase document ID
participant.conditions      # Experimental conditions dict
participant.is_complete     # True if consented, done, not withdrawn
participant.trial_count     # Number of trials
participant.study_data      # Raw trial data list (legacy, may be empty)

# Form data (returns most recent submission)
participant.demographics    # Demographic form data
participant.device_info     # Device survey data
participant.feedback        # Feedback form data
participant.quiz            # Quiz data (final attempt)

# Flexible form access with get_form()
participant.get_form('quiz')                    # Final submission (default)
participant.get_form('quiz', visit=0)           # First attempt
participant.get_form('quiz', visit=1)           # Second attempt
participant.get_form('quiz', all_visits=True)   # All attempts as list

# Page data access
participant.get_page_data('mental_rotation_exp')        # Raw page data with visits
participant.get_page_data_entries('mental_rotation_exp') # All entries as flat list
participant.get_all_page_data()                          # All pageData_* fields

# Data provenance (which code version created this data)
participant.git_commit      # Commit hash
participant.git_branch      # Branch name
participant.git_commit_url  # Link to view the code on GitHub

# Route order visualization
print(participant.route_order_summary())  # Text summary with times
participant.plot_route_order()             # Subway-style visual timeline
participant.plot_route_order(mode="dark")  # With explicit dark mode

# Convert individual's trials to DataFrame
trials = participant.study_data_to_polars()
```

## Polars Best Practices

### Prefer Polars Over Pandas

The smiledata library returns Polars DataFrames. Polars is faster and has a cleaner API. Only convert to pandas when necessary for plotting.

```python
import polars as pl

# Use Polars for data manipulation
result = df.filter(pl.col("rt") > 200)

# Convert to pandas only when plotting
pdf = result.to_pandas()
sns.histplot(data=pdf, x="rt")
```

### Use Method Chaining

```python
# Good: Method chaining is readable
result = (
    trials_df
    .filter(pl.col("correct") == 1)
    .filter(pl.col("rt") > 100)
    .group_by("participant_id", "condition")
    .agg(
        pl.col("rt").mean().alias("mean_rt"),
        pl.col("rt").std().alias("std_rt"),
        pl.len().alias("n_trials")
    )
    .sort("condition", "mean_rt")
)

# Bad: Multiple reassignments
result = trials_df.filter(pl.col("correct") == 1)
result = result.filter(pl.col("rt") > 100)
result = result.group_by("participant_id", "condition")
# ...
```

### Use Expressions, Not Apply

```python
# Good: Vectorized expressions
df = df.with_columns(
    (pl.col("rt") / 1000).alias("rt_seconds"),
    pl.when(pl.col("correct") == 1).then("hit").otherwise("miss").alias("outcome")
)

# Bad: Using apply (slow)
df = df.with_columns(
    pl.col("rt").map_elements(lambda x: x / 1000).alias("rt_seconds")
)
```

### Common Aggregations

```python
# Group statistics
stats = df.group_by("condition").agg(
    pl.col("rt").mean().alias("mean_rt"),
    pl.col("rt").median().alias("median_rt"),
    pl.col("rt").std().alias("std_rt"),
    pl.col("rt").quantile(0.25).alias("q25_rt"),
    pl.col("rt").quantile(0.75).alias("q75_rt"),
    pl.col("correct").mean().alias("accuracy"),
    pl.len().alias("n"),
)

# Multiple columns at once
stats = df.group_by("participant_id").agg(
    pl.col("rt", "confidence").mean().name.suffix("_mean"),
    pl.col("rt", "confidence").std().name.suffix("_std"),
)
```

### Filtering Patterns

```python
# Multiple conditions
filtered = df.filter(
    (pl.col("rt") > 100) &
    (pl.col("rt") < 3000) &
    (pl.col("correct") == 1)
)

# Filter by list of values
filtered = df.filter(pl.col("condition").is_in(["A", "B"]))

# Filter nulls
clean = df.filter(pl.col("response").is_not_null())
```

### Joining DataFrames

```python
# Join participant info with trial data
combined = trials_df.join(
    participants_df.select("participant_id", "age", "condition"),
    on="participant_id",
    how="left"
)
```

## Plotting with Seaborn and Matplotlib

### Basic Setup

Always set up a clean, publication-ready style:

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Set style at the start of your notebook
sns.set_theme(style="whitegrid", context="notebook", font_scale=1.1)

# Or for publications
sns.set_theme(style="ticks", context="paper", font_scale=1.2)
```

### Color Palettes

Use consistent, accessible color palettes:

```python
# Good palette choices
palette = "Set2"        # Soft, distinguishable colors
palette = "colorblind"  # Colorblind-friendly
palette = "deep"        # Seaborn default, good contrast
palette = "muted"       # Softer version of deep

# Apply to plots
sns.barplot(data=pdf, x="condition", y="rt", palette="Set2")

# Or set globally
sns.set_palette("Set2")
```

### Bar Charts with Error Bars

```python
import matplotlib.pyplot as plt
import seaborn as sns

# Seaborn automatically computes error bars (95% CI by default)
fig, ax = plt.subplots(figsize=(8, 5))
sns.barplot(
    data=trials_df.to_pandas(),
    x="condition",
    y="rt",
    errorbar="se",  # Standard error (or "ci" for confidence interval)
    palette="Set2",
    ax=ax
)
ax.set_xlabel("Condition")
ax.set_ylabel("Reaction Time (ms)")
ax.set_title("Mean RT by Condition")
sns.despine()
plt.tight_layout()
```

### Histograms

```python
fig, ax = plt.subplots(figsize=(8, 5))
sns.histplot(
    data=trials_df.to_pandas(),
    x="rt",
    bins=50,
    kde=True,  # Add kernel density estimate
    ax=ax
)
ax.set_xlabel("Reaction Time (ms)")
ax.set_ylabel("Count")
ax.set_title("Response Time Distribution")
sns.despine()
plt.tight_layout()
```

### Box Plots and Violin Plots

```python
# Box plot
fig, ax = plt.subplots(figsize=(8, 5))
sns.boxplot(
    data=trials_df.to_pandas(),
    x="condition",
    y="rt",
    palette="Set2",
    ax=ax
)
ax.set_xlabel("Condition")
ax.set_ylabel("Reaction Time (ms)")
sns.despine()

# Violin plot (shows distribution shape)
fig, ax = plt.subplots(figsize=(8, 5))
sns.violinplot(
    data=trials_df.to_pandas(),
    x="condition",
    y="rt",
    palette="Set2",
    inner="box",  # Show box plot inside
    ax=ax
)
sns.despine()
```

### Point Plots (Good for Interactions)

```python
fig, ax = plt.subplots(figsize=(8, 5))
sns.pointplot(
    data=trials_df.to_pandas(),
    x="block",
    y="correct",
    hue="condition",
    errorbar="se",
    markers=["o", "s"],
    linestyles=["-", "--"],
    palette="Set2",
    ax=ax
)
ax.set_xlabel("Block")
ax.set_ylabel("Accuracy")
ax.set_ylim(0, 1)
ax.legend(title="Condition")
sns.despine()
```

### Line Plots (Learning Curves)

```python
# Calculate block means first with Polars
block_stats = (
    trials_df
    .with_columns((pl.col("trial_num") // 10).alias("block"))
    .group_by("block", "condition")
    .agg(
        pl.col("correct").mean().alias("accuracy"),
    )
    .sort("block")
)

fig, ax = plt.subplots(figsize=(8, 5))
sns.lineplot(
    data=block_stats.to_pandas(),
    x="block",
    y="accuracy",
    hue="condition",
    marker="o",
    palette="Set2",
    ax=ax
)
ax.set_xlabel("Block")
ax.set_ylabel("Accuracy")
ax.set_ylim(0, 1)
ax.legend(title="Condition")
sns.despine()
plt.tight_layout()
```

### Scatter Plots

```python
fig, ax = plt.subplots(figsize=(8, 6))
sns.scatterplot(
    data=participant_stats.to_pandas(),
    x="mean_rt",
    y="accuracy",
    hue="condition",
    style="condition",
    s=80,  # Point size
    palette="Set2",
    ax=ax
)

# Add regression line
sns.regplot(
    data=participant_stats.to_pandas(),
    x="mean_rt",
    y="accuracy",
    scatter=False,
    color="gray",
    ax=ax
)

ax.set_xlabel("Mean RT (ms)")
ax.set_ylabel("Accuracy")
ax.set_title("Speed-Accuracy Tradeoff")
sns.despine()
```

### Faceted Plots (FacetGrid)

```python
g = sns.FacetGrid(
    data=trials_df.to_pandas(),
    col="condition",
    row="block_type",
    height=4,
    aspect=1.2
)
g.map(sns.histplot, "rt", bins=30)
g.set_axis_labels("Reaction Time (ms)", "Count")
g.set_titles("{col_name} | {row_name}")
plt.tight_layout()
```

### Multi-Panel Figures

```python
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Left panel: RT by condition
sns.barplot(
    data=pdf,
    x="condition",
    y="mean_rt",
    errorbar="se",
    palette="Set2",
    ax=axes[0]
)
axes[0].set_xlabel("Condition")
axes[0].set_ylabel("Mean RT (ms)")
axes[0].set_title("A) Response Time")

# Right panel: Accuracy by condition
sns.barplot(
    data=pdf,
    x="condition",
    y="accuracy",
    errorbar="se",
    palette="Set2",
    ax=axes[1]
)
axes[1].set_xlabel("Condition")
axes[1].set_ylabel("Accuracy")
axes[1].set_ylim(0, 1)
axes[1].set_title("B) Accuracy")

sns.despine()
plt.tight_layout()
```

### Publication-Ready Styling

```python
# Set up for publication
plt.rcParams.update({
    'font.size': 12,
    'axes.labelsize': 14,
    'axes.titlesize': 14,
    'xtick.labelsize': 12,
    'ytick.labelsize': 12,
    'legend.fontsize': 11,
    'figure.dpi': 150,
    'savefig.dpi': 300,
    'savefig.bbox': 'tight',
})

# Save figures
fig.savefig("figures/rt_by_condition.pdf")
fig.savefig("figures/rt_by_condition.png", dpi=300)
```

### Built-in Plotting Functions

The smiledata library includes convenience functions that support both light and dark mode themes.

#### Dark Mode Support

All plotting functions automatically adapt to the current theme. In marimo notebooks, the theme is auto-detected. You can also manually control theme colors:

```python
from smiledata import detect_theme, get_theme_colors

# Auto-detect theme (works in marimo)
theme = detect_theme()  # Returns "light" or "dark"

# Get theme-appropriate colors
colors = get_theme_colors()  # Auto-detect
colors = get_theme_colors("dark")  # Force dark mode

# Color keys available:
# - text_color: Primary text color
# - muted_color: Secondary/muted text
# - node_fill: Fill color for chart elements
# - edge_color: Border/edge colors
# - grid_color: Grid line color
```

All built-in plots make backgrounds transparent and style text/ticks appropriately for the theme.

#### Available Plot Types

```python
from smiledata.plotting import (
    plot_completion_rate,
    plot_trial_rt_distribution,
    plot_accuracy_by_condition,
    plot_rt_by_condition,
    plot_participant_timeline,
)

# plot_completion_rate - Horizontal bar chart showing complete/withdrawn/incomplete
ax = plot_completion_rate(data)

# plot_trial_rt_distribution - Histogram of reaction times
ax = plot_trial_rt_distribution(trials_df, rt_column="rt", bins=50)

# plot_accuracy_by_condition - Bar chart with SE error bars
ax = plot_accuracy_by_condition(trials_df, condition_col="condition", correct_col="correct")

# plot_rt_by_condition - Box plot of RT by condition
ax = plot_rt_by_condition(trials_df, condition_col="condition", rt_column="rt")

# plot_participant_timeline - Cumulative enrollment over time
ax = plot_participant_timeline(data)

# Compose into multi-panel figures (all accept optional ax parameter)
fig, axes = plt.subplots(1, 2, figsize=(12, 5))
plot_completion_rate(data, ax=axes[0])
plot_trial_rt_distribution(trials_df, ax=axes[1])
plt.tight_layout()
```

#### Participant Route Visualization

```python
# Text summary of routes and time spent
print(participant.route_order_summary())

# Subway-style visual timeline (auto-detects theme)
ax = participant.plot_route_order()

# With explicit theme control
ax = participant.plot_route_order(mode="dark")
```

## Complete Analysis Example

```python
from smiledata import load_latest
import polars as pl
import matplotlib.pyplot as plt
import seaborn as sns

# Set style
sns.set_theme(style="whitegrid", context="notebook")

# Load data
data = load_latest("data/")
print(f"Loaded {len(data)} participants")
print(f"Available pages: {data.available_pages()}")
print(data.summary())

# Filter to complete participants
complete = data.complete_only()
print(f"Complete: {len(complete)}")

# Get trial data from a specific page
trials = complete.to_trials_df(page="experiment")

# Clean data: remove outliers
trials_clean = trials.filter(
    (pl.col("rt") > 100) &
    (pl.col("rt") < 3000)
)

# Calculate participant-level stats
participant_stats = (
    trials_clean
    .group_by("participant_id")
    .agg(
        pl.col("rt").mean().alias("mean_rt"),
        pl.col("rt").median().alias("median_rt"),
        pl.col("correct").mean().alias("accuracy"),
        pl.len().alias("n_trials")
    )
)

# Join with conditions
conditions_df = pl.DataFrame([
    {"participant_id": p.id, "condition": p.conditions.get("condition", "unknown")}
    for p in complete
])

participant_stats = participant_stats.join(conditions_df, on="participant_id")

# Convert to pandas for plotting
pdf = participant_stats.to_pandas()

# Create figure
fig, axes = plt.subplots(1, 2, figsize=(12, 5))

# Plot RT by condition
sns.barplot(
    data=pdf,
    x="condition",
    y="mean_rt",
    errorbar="se",
    palette="Set2",
    ax=axes[0]
)
axes[0].set_xlabel("Condition")
axes[0].set_ylabel("Mean RT (ms)")
axes[0].set_title("Response Time by Condition")

# Plot accuracy by condition
sns.barplot(
    data=pdf,
    x="condition",
    y="accuracy",
    errorbar="se",
    palette="Set2",
    ax=axes[1]
)
axes[1].set_xlabel("Condition")
axes[1].set_ylabel("Accuracy")
axes[1].set_ylim(0, 1)
axes[1].set_title("Accuracy by Condition")

sns.despine()
plt.tight_layout()
plt.show()
```

## Notebook Best Practices

### Jupyter Notebooks

1. Start with imports and data loading in the first cells
2. Use markdown cells to explain each analysis step
3. Keep cells focused on one task
4. Display intermediate results to verify correctness
5. Use `%matplotlib inline` or `%matplotlib widget` for interactive plots

### Marimo Notebooks

1. Marimo auto-runs cells reactively - be mindful of expensive computations
2. Use `mo.md()` for formatted markdown output
3. Use `mo.ui` components for interactive elements

```python
import marimo as mo
from smiledata import load_latest

data = load_latest("../data")
mo.md(f"Loaded **{len(data)}** participants ({data.complete_count} complete)")
```

## Common Patterns

### Excluding Practice Trials

```python
trials = trials.filter(pl.col("is_practice") == False)
# or
trials = trials.filter(~pl.col("block").str.contains("practice"))
```

### Computing d-prime

```python
def compute_dprime(hits: float, false_alarms: float) -> float:
    from scipy import stats
    # Correct for extreme values
    hits = max(0.01, min(0.99, hits))
    false_alarms = max(0.01, min(0.99, false_alarms))
    return stats.norm.ppf(hits) - stats.norm.ppf(false_alarms)
```

### Adding Trial Numbers Within Participant

```python
trials = trials.with_columns(
    pl.col("rt").cum_count().over("participant_id").alias("trial_num")
)
```

### Calculating Reaction Time Percentiles

```python
rt_percentiles = (
    trials
    .group_by("participant_id")
    .agg(
        pl.col("rt").quantile(0.1).alias("rt_p10"),
        pl.col("rt").quantile(0.5).alias("rt_p50"),
        pl.col("rt").quantile(0.9).alias("rt_p90"),
    )
)
```

### Checking Data Provenance

```python
# See which code version generated the data
for p in data[:3]:
    print(f"{p.id}: {p.git_branch} @ {p.git_commit[:7]}")
    print(f"  -> {p.git_commit_url}")
```
