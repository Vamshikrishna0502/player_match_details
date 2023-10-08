const express = require("express");
const app = express();
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketMatchDetails.db");
app.use(express.json());

let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB: error is ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//get all players

app.get("/players/", async (request, response) => {
  const query = `SELECT
      player_id AS playerId,
      player_name AS playerName
      FROM
      player_details;`;
  const playersArray = await db.all(query);
  response.send(playersArray);
});

//specific player

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const query = `SELECT
      player_id AS playerId,
      player_name AS playerName
      FROM
      player_details
      WHERE player_id = ${playerId};`;

  const details = await db.get(query);
  response.send(details);
});

//put

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName } = request.body;

  const query = `UPDATE player_details
  SET
  player_name = '${playerName}'
  WHERE 
  player_id = ${playerId};`;

  await db.run(query);
  response.send("Player Details Updated");
});

//specific match

app.get("/matches/:matchId/", async (request, response) => {
  const { matchId } = request.params;

  const query = `SELECT 
  match_id AS matchId,
  match,
  year
  FROM
  match_details
  WHERE match_id = ${matchId};`;

  const match = await db.get(query);
  response.send(match);
});

//all matches of a player

app.get("/players/:playerId/matches", async (request, response) => {
  const { playerId } = request.params;

  const matchQuery = `SELECT 
  match_id AS matchId,
  match,
  year
  FROM player_match_score NATURAL JOIN
  match_details
  WHERE player_id = ${playerId}`;

  const matchesArray = await db.all(matchQuery);
  response.send(matchesArray);
});

//list of players of specific match

app.get("/matches/:matchId/players", async (request, response) => {
  const { matchId } = request.params;

  const query = `SELECT 
  player_id AS playerId,
  player_name AS playerName
  FROM  player_match_score NATURAL JOIN
  player_details
  WHERE match_id = ${matchId};`;

  const playerDetails = await db.all(query);
  response.send(playerDetails);
});

//total of each player

app.get("/players/:playerId/playerScores", async (request, response) => {
  const { playerId } = request.params;

  const query = `SELECT 
  player_id AS playerId,
  player_name AS playerName,
  sum(score) AS totalScore,
  sum(fours) AS totalFours,
  sum(sixes) AS totalSixes
  FROM  player_match_score NATURAL JOIN
  player_details
  WHERE player_id = ${playerId};`;

  const playerTotalDetails = await db.get(query);
  response.send(playerTotalDetails);
});

module.exports = app;
