import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import style from "./styles.module.scss";
import Card from "../../components/Card";

//const ENDPOINT = "https://dealer-backend.herokuapp.com/";
const ENDPOINT = "http://localhost:3000";

const Loading = () => <h1>joining room</h1>;

const Room = () => {
  const [socket, setSocket] = useState<any>(null);
  const [showOdds, setShowOdds] = useState<boolean>(false);
  const [game, updateGame] = useState<any>({
    inGame: false,
    centerCards: [],
    odds: [],
  });
  const gameRef = useRef(game);

  useEffect(() => {
    gameRef.current = game;
  });

  useEffect(() => {
    setSocket(io(ENDPOINT));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on("joined", updateGameState);
    socket.on("playerJoined", updateGameState);
    socket.on("playerLeft", updateGameState);

    socket.on("reset", () => {
      console.log("reset ");
      updateGameState({
        host: gameRef.current.host,
        numPlayers: gameRef.current.numPlayers,
        centerCards: [],
        odds: [],
        cards: [],
        inGame: false,
      });
    });

    socket.on("deal", updateGameState);

    socket.on("odds", ({ odds }: { odds: string }) => {
      const oddsList = [...gameRef.current.odds, odds];
      updateGameState({ odds: oddsList });
    });

    socket.on("showOdds", () => {
      setShowOdds(true);
    });

    socket.on("center-pile", updateGameState);

    return () => {
      socket.off("joined", updateGameState);
      socket.off("playerJoined", updateGameState);
      socket.off("playerLeft", updateGameState);
    };
  }, [socket]);

  const startHand = () => {
    socket.emit("deal");
  };

  const nextCard = () => {
    socket.emit("cardsWanted");
  };

  const updateGameState = (newData: any) => {
    if (newData.centerCards && newData.centerCards.length > 0) {
      newData.centerCards.unshift(...gameRef.current.centerCards);
    }

    console.log("next state = ", {
      ...gameRef.current,
      ...newData,
    });

    updateGame({
      ...gameRef.current,
      ...newData,
    });
  };

  if (!socket) return <Loading />;

  if (!game) return <Loading />;

  if (!game.inGame)
    return (
      <div className={style.container}>
        <h5>{game.numPlayers} people playing</h5>
        {game.host && <button onClick={startHand}>start game</button>}
      </div>
    );

  console.log(game);

  return (
    <div className={style.container}>
      <h5>{game.numPlayers} people playing</h5>
      <h5>board</h5>
      <div className={style.board}>
        {game.centerCards.map((card: string) => (
          <Card card={card} />
        ))}
      </div>
      <h5>your hand</h5>
      <div className={style.hand}>
        {game.cards.map((card: string) => (
          <Card card={card} isFlippable />
        ))}
      </div>
      {showOdds && (
        <div>
          <ul>
            {game.odds.map((odd: string) => (
              <li>{odd}%</li>
            ))}
          </ul>
        </div>
      )}

      {game.host && <button onClick={nextCard}>Next</button>}
    </div>
  );

  return (
    <div className={style.container}>
      <h5>{game.numPlayers} people playing</h5>
      {game.host && !game.inGame && (
        <button onClick={startHand}>start game</button>
      )}
      <h5>board</h5>
      {game.inGame && (
        <div className={style.board}>
          {game.centerCards.map((card: string) => (
            <img
              key={card}
              src={process.env.PUBLIC_URL + "/card-images/" + card + ".png"}
            />
          ))}
        </div>
      )}
      <h5>your hand</h5>
      {game.inGame && (
        <div className={style.hand}>
          {game.cards.map((card: string) => (
            <img
              key={card}
              src={process.env.PUBLIC_URL + "/card-images/" + card + ".png"}
            />
          ))}
        </div>
      )}

      {game.inGame && game.host && <button onClick={nextCard}>Next</button>}
    </div>
  );
};

export default Room;
