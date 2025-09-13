import os
import json
import csv

base_dir = "./input/tests/measure"
output_file = "./input/tests/comparison/expected_results.csv"

header = ["measure_name", "guid", "display_name", "count"]
rows = []

for measure_name in os.listdir(base_dir):
    measure_path = os.path.join(base_dir, measure_name)
    if os.path.isdir(measure_path):
        for root, _, files in os.walk(measure_path):
            for file in files:
                if file.startswith("MeasureReport-") and file.endswith(".json"):
                    # Extract the GUID from the parent folder name
                    guid = os.path.basename(root)
                    file_path = os.path.join(root, file)
                    with open(file_path, "r") as f:
                        data = json.load(f)
                        for group in data.get("group", []):
                            for pop in group.get("population", []):
                                display = pop["code"]["coding"][0].get("display", "")
                                count = pop.get("count", "")
                                rows.append([measure_name, guid, display, count])

os.makedirs(os.path.dirname(output_file), exist_ok=True)
with open(output_file, "w", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(header)
    writer.writerows(rows)