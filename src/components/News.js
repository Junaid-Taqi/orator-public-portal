import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  InputGroup,
  Badge
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faCalendarDays } from "@fortawesome/free-solid-svg-icons";

const News = () => {
  return (
    <div className="news-wrapper text-white">
      <Container className="py-5">

        {/* Heading */}
        <h1 className="fw-bold mb-2">News & Updates</h1>
        <p className="subtitle">
          Stay informed about what's happening in your community
        </p>

        {/* Search Box */}
        <div className="search-glass p-3 mt-4 mb-5">
          <Row className="align-items-center">
            <Col md={9}>
              <InputGroup>
                <InputGroup.Text className="search-icon">
                  <FontAwesomeIcon icon={faSearch} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search news..."
                  className="search-input"
                />
              </InputGroup>
            </Col>

            <Col md={3} className="mt-3 mt-md-0">
              <Form.Select className="search-select">
                <option>All</option>
                <option>Events</option>
                <option>Community</option>
              </Form.Select>
            </Col>
          </Row>
        </div>

        {/* Cards */}
        <Row className="g-4">
          <Col md={6}>
            <Card className="news-card border-0 text-white">
              <div className="news-image">🎉</div>

              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <Badge className="badge-custom">Events</Badge>
                  <small className="date-text">
                    <FontAwesomeIcon icon={faCalendarDays} /> March 1, 2026
                  </small>
                </div>

                <Card.Title>
                  Spring Festival 2026 - Save the Date!
                </Card.Title>

                <Card.Text className="card-desc">
                  Join us for our annual Spring Festival on March 15th.
                  Fun for the whole family!
                </Card.Text>

                <div className="d-flex justify-content-between mt-3">
                  <small className="author-text">By Events Team</small>
                  <span className="read-more">Read More →</span>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="news-card border-0 text-white">
              <div className="news-image">🏢</div>

              <Card.Body>
                <div className="d-flex justify-content-between mb-2">
                  <Badge className="badge-custom-2">Community</Badge>
                  <small className="date-text">
                    <FontAwesomeIcon icon={faCalendarDays} /> February 28, 2026
                  </small>
                </div>

                <Card.Title>
                  New Community Center Opening
                </Card.Title>

                <Card.Text className="card-desc">
                  State-of-the-art facility opens next month with sports,
                  arts, and education programs.
                </Card.Text>

                <div className="d-flex justify-content-between mt-3">
                  <small className="author-text">By Community Services</small>
                  <span className="read-more">Read More →</span>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

      </Container>
    </div>
  );
};

export default News;