import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";

const CreateDonorProfile = ({save}) => {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");

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
            Create Donor Profile
        </Button>
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
            <Modal.Title>New Donor Profile</Modal.Title>
            </Modal.Header>
            <Form>
            <Modal.Body>
                <FloatingLabel
                controlId="inputName"
                label="Name"
                className="mb-3"
                >
                <Form.Control
                    type="text"
                    onChange={(e) => {
                    setName(e.target.value);
                    }}
                    placeholder="Enter your name"
                />
                </FloatingLabel>
                <FloatingLabel
                controlId="inputEmail"
                label="Email"
                className="mb-3"
                >
                <Form.Control
                    type="email"
                    onChange={(e) => {
                    setEmail(e.target.value);
                    }}
                    placeholder="Enter your email"
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
                    save({name, email});
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

export default CreateDonorProfile