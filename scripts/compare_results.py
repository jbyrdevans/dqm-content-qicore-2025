import csv

expected_file = "./input/tests/comparison/expected_results.csv"
actual_file = "./input/tests/comparison/actual_results.csv"
error_file = "./input/tests/comparison/error_results.csv"

expected_rows = {}
with open(expected_file, "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        key = (row["measure_name"], row["guid"], row["display_name"])
        expected_rows[key] = row["count"]

actual_rows = {}
with open(actual_file, "r") as f:
    reader = csv.DictReader(f)
    for row in reader:
        key = (row["measure_name"], row["guid"], row["display_name"])
        actual_rows[key] = row["count"]

header = ["measure_name", "guid", "display_name", "expected_result", "actual_result"]
errors = []

for key, expected_result in expected_rows.items():
    actual_result = actual_rows.get(key)
    if actual_result is None or str(expected_result) != str(actual_result):
        errors.append([key[0], key[1], key[2], expected_result, actual_result if actual_result is not None else "MISSING"])

with open(error_file, "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(errors)