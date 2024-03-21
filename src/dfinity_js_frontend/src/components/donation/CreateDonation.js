import React, { useState } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Form, FloatingLabel } from "react-bootstrap";

const CreateDonation = ({save}) => {


    const [amount, setAmount] = useState(0);
  

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
            Update Donation Record
        </Button>
        <Modal show={show} onHide={handleClose} centered>
          <Modal.Header closeButton>
            <Modal.Title>New Donation</Modal.Title>
          </Modal.Header>
          <Form>
            <Modal.Body>
              <FloatingLabel
                controlId="inputName"
                label="Donation Amount"
                className="mb-3"
              >
                <Form.Control
                  type="number"
                  onChange={(e) => {
                    setAmount(e.target.value);
                  }}
                  placeholder="Enter donation amount"
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
                  save({amount});
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

export default CreateDonation