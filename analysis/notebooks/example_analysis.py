# /// script
# requires-python = ">=3.11"
# dependencies = [
#     "marimo",
#     "pyzmq",
# ]
# ///

import marimo

__generated_with = "0.18.4"
app = marimo.App(width="medium", css_file="marimo.css")


@app.cell
def _():
    import marimo as mo
    import polars as pl
    return mo, pl


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    # Smile Data Analysis Example

    This notebook demonstrates how to use the `smiledata` library to analyze
    experiment data exported from Smile.
    """)
    return


@app.cell
def _():
    import smiledata as sd
    return (sd,)


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## Load Data
    """)
    return


@app.cell
def _(sd):
    # Load the most recent data file from the data folder
    # You can also use load_json("path/to/specific/file.json")
    data = sd.load_latest("data")
    print(f"Loaded {len(data)} participants")
    print(f"Available pages: {data.available_pages()}")
    return (data,)


@app.cell(hide_code=True)
def _(data, mo):
    mo.md(f"""
    ## Summary\n\n{data.summary()}
    """)
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## Filter to Complete Participants
    """)
    return


@app.cell
def _(data):
    # Filter to only complete participants (consented, done, not withdrawn)
    complete = data.complete_only()
    print(f"Complete participants: {len(complete)}")
    return (complete,)


@app.cell
def _(complete):
    complete
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## Inspect a Single Participant

    You can access individual participants by index and inspect their metadata.
    """)
    return


@app.cell
def _(complete):
    # Select the first complete participant
    participant = complete[0]

    print(f"ID: {participant.id}")
    print(f"Conditions: {participant.conditions}")
    print(f"Complete: {participant.is_complete}")
    print(f"Trial count: {participant.trial_count}")
    print(f"Timezone: {participant.timezone}")
    return (participant,)


@app.cell
def _(participant):
    # View data provenance (which code version created this data)
    print(f"Git branch: {participant.git_branch}")
    print(f"Git commit: {participant.git_commit[:7]}")
    print(f"Commit URL: {participant.git_commit_url}")
    return


@app.cell
def _(participant):
    # View route order with time spent at each route (text summary)
    print(participant.route_order_summary())
    return


@app.cell
def _(participant):
    # Visualize route order as a horizontal bar chart
    participant.plot_route_order()
    return


@app.cell
def _(participant):
    # View available page data for this participant
    page_data_keys = list(participant.get_all_page_data().keys())
    print(f"Page data available: {page_data_keys}")
    return


@app.cell
def _(participant, pl):
    # Get a specific page's data as a DataFrame
    mr_data = participant.get_page_data("mental_rotation_exp")

    participant_trials = (
        pl.DataFrame(mr_data["visit_0"]["data"]) if mr_data else None
    )
    participant_trials.head(
        5
    ) if participant_trials is not None else "No trial data found"
    return


@app.cell
def _(participant):
    # View demographics for this participant
    participant.demographics
    return


@app.cell
def _(participant):
    # View device info for this participant
    participant.device_info
    return


@app.cell
def _(participant):
    # View feedback for this participant
    participant.feedback
    return


@app.cell
def _(participant):
    # View quiz data (final attempt) using property shortcut
    participant.quiz
    return


@app.cell
def _(participant):
    # Use get_form() for flexible access to any form data:
    #   get_form('quiz')              - final submission (default)
    #   get_form('quiz', visit=0)     - first attempt
    #   get_form('quiz', all_visits=True) - all attempts

    # Get all quiz attempts
    quiz_attempts = participant.get_form("quiz", all_visits=True)
    print(f"Number of quiz attempts: {len(quiz_attempts)}")

    # Get first attempt specifically
    first_attempt = participant.get_form("quiz", visit=0)
    first_attempt
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## Convert to DataFrame
    """)
    return


@app.cell
def _(complete):
    # Get trial-level DataFrame for a specific page
    # Use available_pages() to see what pages exist in your data
    trials = complete.to_trials_df(page="mental_rotation_exp")
    trials
    return (trials,)


@app.cell
def _(pl, trials):
    # Normalize RTs within subject to z-scores
    trials_with_zrt = trials.with_columns(
        (
            (pl.col("rt") - pl.col("rt").mean().over("participant_id"))
            / pl.col("rt").std().over("participant_id")
        ).alias("rt_zscore")
    )

    trials_with_zrt.select("participant_id", "rt", "rt_zscore").head(10)
    return (trials_with_zrt,)


@app.cell
def _(pl, trials_with_zrt):
    import seaborn as sns
    import matplotlib.pyplot as plt
    from smiledata import detect_theme, get_theme_colors

    # Filter trials for mirror==false and correct==true, then calculate abs(disparity)
    _filtered_trials = trials_with_zrt.filter(
        (pl.col("mirror") == False) & (pl.col("correct") == 1)
    ).with_columns(pl.col("disparity").abs().alias("abs_disparity"))

    # Convert to pandas for seaborn
    _filtered_df = _filtered_trials.to_pandas()

    # Get theme-aware colors
    theme = detect_theme()
    colors = get_theme_colors(theme)

    # Set style based on theme
    sns.set_style("darkgrid" if theme == "dark" else "whitegrid")

    # Create figure with transparent background
    fig, ax = plt.subplots(figsize=(10, 6))
    fig.patch.set_facecolor("none")
    ax.set_facecolor("none")

    # Create regression plot with trend line using seaborn
    sns.regplot(
        data=_filtered_df,
        x="abs_disparity",
        y="rt_zscore",
        scatter_kws={"alpha": 0.5},
        line_kws={"color": "red", "linewidth": 2},
        ax=ax,
    )

    # Set labels and title with theme-aware colors
    ax.set_xlabel("Absolute Disparity", color=colors["text_color"])
    ax.set_ylabel("Reaction Time (z-score)", color=colors["text_color"])
    ax.set_title(
        "Normalized Reaction Time vs Absolute Disparity (Mirror=False, Correct=True)",
        color=colors["text_color"],
    )

    # Style ticks and spines
    ax.tick_params(colors=colors["muted_color"])
    for spine in ax.spines.values():
        spine.set_edgecolor(colors["muted_color"])

    # Style grid lines with muted color
    ax.grid(True, color=colors["muted_color"], alpha=0.5)

    plt.tight_layout()
    plt.gca()
    return detect_theme, get_theme_colors, plt, sns


@app.cell
def _(detect_theme, get_theme_colors, pl, plt, sns, trials_with_zrt):
    # Filter trials for mirror==false and correct==true, then calculate abs(disparity)
    _filtered_trials_per_subj = trials_with_zrt.filter(
        (pl.col("mirror") == False) & (pl.col("correct") == 1)
    ).with_columns(pl.col("disparity").abs().alias("abs_disparity"))

    # Convert to pandas for seaborn
    _filtered_df_per_subj = _filtered_trials_per_subj.to_pandas()

    # Get theme-aware colors
    _theme = detect_theme()
    _colors = get_theme_colors(_theme)

    # Set style based on theme
    sns.set_style("darkgrid" if _theme == "dark" else "whitegrid")

    # Get number of unique participants to determine grid size
    _n_participants = _filtered_df_per_subj["participant_id"].nunique()
    _n_cols = 3
    _n_rows = (_n_participants + _n_cols - 1) // _n_cols

    # Create FacetGrid with one panel per participant
    _g = sns.FacetGrid(
        _filtered_df_per_subj,
        col="participant_id",
        col_wrap=_n_cols,
        height=3,
        aspect=1.2,
        sharex=True,
        sharey=True,
    )

    # Set transparent background on figure
    _g.figure.patch.set_facecolor("none")

    # Map regression plot to each facet
    _g.map_dataframe(
        sns.regplot,
        x="abs_disparity",
        y="rt_zscore",
        scatter_kws={"alpha": 0.5, "s": 20},
        line_kws={"color": "red", "linewidth": 2},
    )

    # Set labels and title with theme-aware colors
    _g.set_axis_labels("Absolute Disparity", "Reaction Time (z-score)")
    _g.set_titles("{col_name}")
    _g.figure.suptitle(
        "Normalized Reaction Time vs Absolute Disparity per Participant\n(Mirror=False, Correct=True)",
        y=1.02,
        color=_colors["text_color"],
    )

    # Apply theme-aware styling to each axis
    for _ax in _g.axes.flat:
        _ax.set_facecolor("none")
        _ax.xaxis.label.set_color(_colors["text_color"])
        _ax.yaxis.label.set_color(_colors["text_color"])
        _ax.title.set_color(_colors["text_color"])
        _ax.tick_params(colors=_colors["text_color"])
        for _spine in _ax.spines.values():
            _spine.set_edgecolor(_colors["muted_color"])
        # Style grid lines with muted color
        _ax.grid(True, color=_colors["muted_color"], alpha=0.5)

    plt.tight_layout()
    plt.gca()
    return


@app.cell
def _(mo, pl, trials_with_zrt):
    import statsmodels.api as sm

    # Filter trials for mirror==false and correct==true, then calculate abs(disparity)
    _regression_data = trials_with_zrt.filter(
        (pl.col("mirror") == False) & (pl.col("correct") == 1)
    ).with_columns(pl.col("disparity").abs().alias("abs_disparity"))

    # Run regression for each participant and store results
    regression_results = {}
    _participant_ids = (
        _regression_data.select("participant_id").unique().to_series().to_list()
    )

    for _pid in _participant_ids:
        _subj_data = _regression_data.filter(
            pl.col("participant_id") == _pid
        ).to_pandas()

        # Prepare X and y
        _X = sm.add_constant(_subj_data["abs_disparity"])
        _y = _subj_data["rt_zscore"]

        # Fit OLS regression
        _model = sm.OLS(_y, _X).fit()
        regression_results[_pid] = _model

    # Create dropdown for selecting participant
    participant_dropdown = mo.ui.dropdown(
        options={pid: pid for pid in sorted(_participant_ids)},
        value=sorted(_participant_ids)[0],
        label="Select Participant",
    )
    return participant_dropdown, regression_results


@app.cell
def _(mo, participant_dropdown, regression_results):
    # Get the selected participant's regression results
    _selected_pid = participant_dropdown.value
    _selected_model = regression_results.get(_selected_pid)

    # Display dropdown and regression summary
    mo.vstack(
        [
            participant_dropdown,
            mo.md(f"### Regression Results for Participant: {_selected_pid}"),
            mo.md(f"```\n{_selected_model.summary().as_text()}\n```")
            if _selected_model
            else mo.md("No results available"),
        ]
    )
    return


@app.cell
def _(pl, regression_results):
    # Combine all regression results into a single DataFrame
    _regression_summary_data = []

    for _pid, _model in regression_results.items():
        _row = {
            "participant_id": _pid,
            "intercept": _model.params["const"],
            "intercept_se": _model.bse["const"],
            "intercept_t": _model.tvalues["const"],
            "intercept_pvalue": _model.pvalues["const"],
            "slope": _model.params["abs_disparity"],
            "slope_se": _model.bse["abs_disparity"],
            "slope_t": _model.tvalues["abs_disparity"],
            "slope_pvalue": _model.pvalues["abs_disparity"],
            "r_squared": _model.rsquared,
            "r_squared_adj": _model.rsquared_adj,
            "f_statistic": _model.fvalue,
            "f_pvalue": _model.f_pvalue,
            "n_observations": int(_model.nobs),
        }
        _regression_summary_data.append(_row)

    regression_summary_df = pl.DataFrame(_regression_summary_data).sort(
        "participant_id"
    )
    regression_summary_df
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## Basic Analysis
    """)
    return


@app.cell
def _(complete, pl, trials):
    # Calculate mean RT and accuracy per participant
    has_rt_correct = "rt" in trials.columns and "correct" in trials.columns
    participant_stats = (
        trials.group_by("participant_id").agg(
            pl.col("rt").mean().alias("mean_rt"),
            pl.col("correct").mean().alias("accuracy"),
        )
        if has_rt_correct
        else complete.to_participants_df()
    )
    participant_stats
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## Demographics
    """)
    return


@app.cell
def _(complete):
    # Get demographics DataFrame
    demographics = complete.demographics_df()
    demographics.head()
    return


@app.cell(hide_code=True)
def _(mo):
    mo.md("""
    ## Plotting
    """)
    return


@app.cell
def _(data):
    from smiledata.plotting import plot_completion_rate

    # Plot completion rate
    plot_completion_rate(data)
    return


@app.cell
def _():
    return


@app.cell
def _(mo, trials):
    from smiledata.plotting import plot_trial_rt_distribution

    # Plot RT distribution (if RT column exists)
    if "rt" in trials.columns:
        _rt_fig = plot_trial_rt_distribution(trials, rt_column="rt")
    else:
        _rt_fig = mo.md("No 'rt' column found in trials data")

    _rt_fig
    return


@app.cell
def _():
    return


if __name__ == "__main__":
    app.run()
