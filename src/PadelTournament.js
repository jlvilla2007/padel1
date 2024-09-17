import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';

const PadelTournament = () => {
  const [numRounds, setNumRounds] = useState(1);
  const [pairs, setPairs] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [results, setResults] = useState([]);
  const [isLastRound, setIsLastRound] = useState(false);

  const handleAddPair = () => {
    setPairs([...pairs, { name: '', wins: 0, losses: 0, pointsFor: 0, pointsAgainst: 0 }]);
  };

  const handlePairNameChange = (index, name) => {
    const newPairs = [...pairs];
    newPairs[index].name = name;
    setPairs(newPairs);
  };

  const startTournament = () => {
    const numCourts = Math.ceil(pairs.length / 2);
    const shuffledPairs = pairs.sort(() => 0.5 - Math.random());
    const initialMatches = [];
    for (let i = 0; i < shuffledPairs.length; i += 2) {
      const court = Math.floor(i / 2) % numCourts;
      initialMatches.push({ court, pair1: shuffledPairs[i], pair2: shuffledPairs[i + 1], score1: 0, score2: 0 });
    }
    setMatches(initialMatches);
    setCurrentRound(1);
  };

  const handleScoreChange = (index, score1, score2) => {
    const newMatches = [...matches];
    newMatches[index].score1 = score1;
    newMatches[index].score2 = score2;
    setMatches(newMatches);
  };

  const submitScores = () => {
    const newPairs = [...pairs];
    matches.forEach(match => {
      const pair1 = newPairs.find(pair => pair.name === match.pair1.name);
      const pair2 = newPairs.find(pair => pair.name === match.pair2.name);
      pair1.pointsFor += match.score1;
      pair1.pointsAgainst += match.score2;
      pair2.pointsFor += match.score2;
      pair2.pointsAgainst += match.score1;
      if (match.score1 > match.score2) {
        pair1.wins += 1;
        pair2.losses += 1;
      } else {
        pair1.losses += 1;
        pair2.wins += 1;
      }
    });
    setPairs(newPairs);
    calculateResults();
    if (currentRound < numRounds) {
      nextRound();
    } else {
      setIsLastRound(true);
    }
  };

  const nextRound = () => {
    const winners = [];
    const losers = [];
    matches.forEach(match => {
      if (match.score1 > match.score2) {
        winners.push(match.pair1);
        losers.push(match.pair2);
      } else {
        winners.push(match.pair2);
        losers.push(match.pair1);
      }
    });

    const numCourts = Math.ceil(pairs.length / 2);
    const newMatches = [];
    for (let i = 0; i < winners.length; i += 2) {
      const court = Math.floor(i / 2) % numCourts;
      newMatches.push({ court, pair1: winners[i], pair2: winners[i + 1], score1: 0, score2: 0 });
    }
    for (let i = 0; i < losers.length; i += 2) {
      const court = Math.floor((i + winners.length) / 2) % numCourts;
      newMatches.push({ court, pair1: losers[i], pair2: losers[i + 1], score1: 0, score2: 0 });
    }

    setMatches(newMatches);
    setCurrentRound(currentRound + 1);
  };

  const calculateResults = () => {
    const finalResults = pairs.sort((a, b) => 
      b.wins - a.wins || 
      a.losses - b.losses || 
      b.pointsFor - a.pointsFor || 
      a.pointsAgainst - b.pointsAgainst
    );
    setResults(finalResults);
  };

  return (
    <Container>
      <h1 className="display-2 text-info">Pozo de Pádel</h1>
      <Form>
        <Form.Group as={Row}>
          <Form.Label column sm="2">Número de Rondas</Form.Label>
          <Col sm="1">
            <Form.Control as="select" value={numRounds} onChange={(e) => setNumRounds(e.target.value)}>
              {[...Array(10).keys()].map(i => <option key={i} value={i+1}>{i+1}</option>)}
            </Form.Control>
          </Col>
        </Form.Group>
        {pairs.map((pair, index) => (
          <Form.Group as={Row} key={index}>
            <Form.Label column sm="2">Pareja {index + 1}</Form.Label>
            <Col sm="2">
              <Form.Control type="text" value={pair.name} onChange={(e) => handlePairNameChange(index, e.target.value)} />
            </Col>
          </Form.Group>
        ))}
        <Button className="btn btn-info"onClick={handleAddPair}>Agregar Pareja</Button>
        <Button className="btn btn-success m-2" onClick={startTournament} disabled={pairs.length % 2 !== 0}>Iniciar Torneo</Button>
      </Form>
      {matches.length > 0 && (
        <div>
          <h2 className="display-3 text-danger">Ronda {currentRound}</h2>
          {matches.map((match, index) => (
            <Form key={index}>
              <Form.Group as={Row}>
                <Form.Label column sm="2">Cancha {match.court + 1}</Form.Label>
                <Col sm="2">
                  <Form.Control type="text" readOnly value={match.pair1.name} />
                </Col>
                <Col sm="1">
                  <Form.Control type="number" value={match.score1} onChange={(e) => handleScoreChange(index, parseInt(e.target.value), match.score2)} />
                </Col>
                <Col sm="1">
                  <Form.Control type="number" value={match.score2} onChange={(e) => handleScoreChange(index, match.score1, parseInt(e.target.value))} />
                </Col>
                <Col sm="2">
                  <Form.Control type="text" readOnly value={match.pair2.name} />
                </Col>
              </Form.Group>
            </Form>
          ))}
          <Button className="btn btn-danger" onClick={submitScores} disabled={isLastRound}>Aceptar Scores</Button>
        </div>
      )}
      <h1 className="display-2 text-success">Posiciones</h1>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Pareja</th>
            <th>Juegos Ganados</th>
            <th>Juegos Perdidos</th>
            <th>Games Favor</th>
            <th>Games Contra</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result, index) => (
            <tr key={index}>
              <td>{result.name}</td>
              <td>{result.wins}</td>
              <td>{result.losses}</td>
              <td>{result.pointsFor}</td>
              <td>{result.pointsAgainst}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default PadelTournament;
