import pandas as pd

def main():
    teams_data = pd.read_csv("teams.csv")
    normalized_teams_csv = "normalized_teams.csv"

    columns_with_numbers = ["team kpm", "dragons", "heralds", "barons", "towers", "inhibitors", "dpm", "vspm", "earned gpm", "cspm", "xpdiffat15"]
    filtered_winning_games = teams_data[teams_data["result"] == 1]

    copy_winning_games = filtered_winning_games.copy()

    for column in columns_with_numbers:
        copy_winning_games[column] = (copy_winning_games[column] - copy_winning_games[column].min()) / (copy_winning_games[column].max() - copy_winning_games[column].min())
    
    copy_winning_games.to_csv(normalized_teams_csv)

if __name__ == "__main__":
    main()
