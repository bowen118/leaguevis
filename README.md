# leaguevis

A data story exploring what makes a good League of Legends team 
based on professional games.

### Repo Structure

+ `css/`: contains custom CSS css `style.css`
+ `data/`:
  + `coords.csv`: coordinate for placement of dots in League icon visualization
  + `inov_sketch.png`: sketch of League icon to extract coordinates
  + `kill_coords.csv`: coordinates of 2021 World Championship kills
  + `normalize.py`: script to normalize teams data
  + `noramlized_teams.csv`: normalized teams data
  + `overall_worlds_msi.csv`: aggregated professional results by region
  + `players.csv`: player data in 2021 professional games
  + `teams.csv`: unnormalized teams data in 2021 professional games
+ `img/`: contains images used in webpage
+ `js`: 
  + `areachart.js`: champion pick/ban visualization
  + `dotplot.js`: importance of various factors visualization
  + `innovative.js`: League icon visualization
  + `kde.js`: kernel density heatmap of kills
  + `main.js`: main file for loading data and initializing visualizations
  + `regionbarchart.js`: compare region placements in championships
  + `regioncountchart.js`: compare region win rates in 2021 World Championship
  + `scatterplot.js`: scatterplot for user to explore the dataset

### Links

+ [Website](https://bowen118.github.io/leaguevis/)
+ [Screencast](https://drive.google.com/file/d/1FNOUPy9gBqdlUWXERxVZ99NjZ1GtfOaX/view?usp=sharing)
