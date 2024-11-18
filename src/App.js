import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import regression from "regression";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale,
} from "chart.js";
import { Container, Row, Col, Form, Button, Card, InputGroup } from "react-bootstrap";

ChartJS.register(
  LineElement,
  PointElement,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  CategoryScale
);

const App = () => {
  const [dataPoints, setDataPoints] = useState([]);
  const [input, setInput] = useState({ fat: "", resistance: "" });
  const [trendlineEquation, setTrendlineEquation] = useState("");
  const [predictedComposition, setPredictedComposition] = useState(null);

  const handleAddData = () => {
    const { fat, resistance } = input;
    if (fat !== "" && resistance !== "") {
      setDataPoints((prev) => [
        ...prev,
        { fat: parseFloat(fat), resistance: parseFloat(resistance) },
      ]);
    }
  };

  const handleGenerateTrendline = () => {
    const formattedData = dataPoints.map((point) => [point.fat, point.resistance]);
    const result = regression.linear(formattedData);
    setTrendlineEquation(result.string);
  };

  const handlePredictComposition = (resistanceValue) => {
    if (trendlineEquation) {
      const [a, b] = trendlineEquation.match(/-?\d+(\.\d+)?/g).map(Number);
      const fat = (resistanceValue - b) / a;
      const protein = 100 - fat;

      setPredictedComposition({
        fat: Math.max(0, Math.min(fat, 100)),
        protein: Math.max(0, Math.min(protein, 100)),
      });
    }
  };

  const chartData = {
    labels: dataPoints.map((point) => point.fat),
    datasets: [
      {
        label: "Measured Resistance",
        data: dataPoints.map((point) => point.resistance),
        borderColor: "blue",
        fill: false,
        pointBackgroundColor: "blue",
      },
      {
        label: "Trendline",
        data: dataPoints.map((point) => {
          const [a, b] = trendlineEquation.match(/-?\d+(\.\d+)?/g) || [0, 0];
          return a * point.fat + parseFloat(b);
        }),
        borderColor: "red",
        borderDash: [5, 5],
        fill: false,
        pointBackgroundColor: "red",
      },
    ],
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center mb-4">Protein-Fat Resistance Experiment</h1>

      {/* 입력 섹션 */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="gy-3">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>지방 비율 (%)</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Enter.."
                  value={input.fat}
                  onChange={(e) => setInput({ ...input, fat: e.target.value })}
                /> %
              </InputGroup>
            </Col>
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text>저항값 (Ω)</InputGroup.Text>
                <Form.Control
                  type="number"
                  placeholder="Enter.."
                  value={input.resistance}
                  onChange={(e) => setInput({ ...input, resistance: e.target.value })}
                />
              </InputGroup>
            </Col>
            <Col md={2}>
              <Button variant="success" onClick={handleAddData} className="w-100">
                Add Data
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 그래프 및 추세선 생성 */}
      {dataPoints.length > 0 && (
        <Card className="mb-4">
          <Card.Body>
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                  legend: { position: "top" },
                },
                scales: {
                  x: {
                    type: "linear",
                    title: { display: true, text: "Fat (%)" },
                  },
                  y: {
                    type: "linear",
                    title: { display: true, text: "Resistance (Ohms)" },
                  },
                },
              }}
              height={300} // 고정된 높이
              width={600} // 고정된 너비
            />
            {trendlineEquation && (
              <p className="text-center mt-3">
                <strong>추세선 함수식:</strong> {trendlineEquation}
              </p>
            )}
          </Card.Body>
        </Card>
      )}

      <Row>
        {/* 추세선 생성 버튼 */}
        <Col md={4} className="mb-3">
          <Button
            variant="primary"
            onClick={handleGenerateTrendline}
            className="w-100"
            disabled={!dataPoints.length}
          >
            추세선 생성
          </Button>
        </Col>

        {/* 저항값으로 구성 예측 */}
        <Col md={8}>
          <InputGroup>
            <InputGroup.Text>예측할 저항값 (Ω)</InputGroup.Text>
            <Form.Control
              type="number"
              placeholder="Enter resistance value"
              onChange={(e) => handlePredictComposition(parseFloat(e.target.value))}
            />
          </InputGroup>
          {predictedComposition && (
            <div className="mt-3 text-center">
              <p>
                <strong>Fat:</strong> {predictedComposition.fat.toFixed(2)}%
              </p>
              <p>
                <strong>Protein:</strong> {predictedComposition.protein.toFixed(2)}%
              </p>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default App;
