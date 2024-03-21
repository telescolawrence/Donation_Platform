import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";

const CreateCampaign = ({save}) => {

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [goal, setGoal] = useState(0);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
  return (
    <>
        <Button
            onClick={handleShow}
            variant="dark"
            style={{marginRight: "10px"}}
        >
            Create Campaign
        </Button>
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
            <Modal.Title>New Campaign</Modal.Title>
            </Modal.Header>
            <Form>
            <Modal.Body>
                <FloatingLabel
                controlId="inputName"
                label="Title"
                className="mb-3"
                >
                <Form.Control
                    type="text"
                    onChange={(e) => {
                    setTitle(e.target.value);
                    }}
                    placeholder="Enter campaign title"
                />
                </FloatingLabel>
                <FloatingLabel
                controlId="inputDescription"
                label="Description"
                className="mb-3"
                >
                <Form.Control
                    type="text"
                    onChange={(e) => {
                    setDescription(e.target.value);
                    }}
                    placeholder="Enter campaign description"
                />
                </FloatingLabel>
                <FloatingLabel
                controlId="inputGoal"
                label="Goal"
                className="mb-3"
                >
                <Form.Control
                    type="number"
                    onChange={(e) => {
                    setGoal(e.target.value);
                    }}
                    placeholder="Enter campaign goal"
                />
                </FloatingLabel>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                Close
                </Button>
                <Button
                variant="primary"
                onClick={() => {
                    save({title, description, goal});
                    handleClose();
                }}
                >
                Save
                </Button>
            </Modal.Footer>
            </Form>
        </Modal>
    </>

  )
}

export default CreateCampaign