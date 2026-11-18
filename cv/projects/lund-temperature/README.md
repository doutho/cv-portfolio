# Lund’s missing thermometer

If the Lund weather station stopped reporting, could two neighbouring SMHI thermometers estimate its temperature at the same moment? This small scikit-learn project tests a two-input linear regression against a practical baseline: copying the temperature in Malmö.

| Method | Mean absolute error | Root mean squared error |
| --- | ---: | ---: |
| Copy Malmö A | 0.474 °C | 0.670 °C |
| Linear regression on Malmö A and Skillinge A | **0.401 °C** | **0.586 °C** |

The model reduced average absolute error by **0.073 °C (15.5%)** over 73 held-out timestamps. Its largest miss was 1.85 °C on 3 November 2021 at 06:00 UTC.

## Explore

- Open [the project page](index.html) in a browser to choose a real test timestamp and reveal the hidden Lund observation. The page works offline.
- Open [the notebook](lund_temperature.ipynb) for the data, train/test split, model, error table and plot. Its final code cell lets you try your own temperatures.
- Open [the aligned CSV](data/temperatures.csv) to see the 255 observations behind the experiment. Each numeric column is air temperature in degrees Celsius.

## Run locally

From this project folder, in your Python environment:

```sh
python -m pip install -r requirements.txt
python -m jupyterlab lund_temperature.ipynb
```

Select **Run → Run All Cells**. The bundled CSV makes the local run independent of downloads after setup. Opening the notebook by itself in Colab makes it rebuild the same CSV in memory from the pinned station files.

## How the test works

Each example is one UTC timestamp shared by all three stations. The inputs are Malmö A and Skillinge A. The target is Lund. Training covers 2 August through 31 October 2021 (182 readings). Testing covers 1 November through 7 December (73 readings). Sorting and splitting by time simulates a later outage. The fitted equation, rounded to three decimals, is:

```text
Lund estimate (°C) = −0.428 + 0.857 × Malmö (°C) + 0.174 × Skillinge (°C)
```

A 1 °C change in Malmö with Skillinge held fixed changes the estimate by about 0.86 °C. This describes the model’s response. Station temperatures move together, so interpreting the weights as separate physical effects would be misleading.

The test covers about five weeks at 06:00 and 18:00 UTC in 2021. More seasons and observation times are needed to assess year-round performance. Both neighbouring sensors must be available at prediction time.

## Data provenance

SMHI station 53430 (Lund), 52350 (Malmö A) and 54290 (Skillinge A). The filename `smhi-simrishamn.csv` refers to the municipality. Its station header identifies Skillinge A. This project retains quality flag G, joins observations on exact UTC timestamps and renames the numeric columns. No interpolation is used. The notebook includes the steps to rebuild the table from the pinned exports. [Source snapshot](https://github.com/Rilr20/bth-matmod-proj/tree/eba34d82a4bffd30b656fbc6a291e43253165f94/data) · [SMHI open-data terms](https://www.smhi.se/data/om-smhis-data/villkor-for-anvandning) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
