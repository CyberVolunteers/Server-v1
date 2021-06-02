"use strict";

const e = React.createElement;

// TODO: add a Jumbotron
const { Alert, Image, Modal, Button, Carousel, Card } = ReactBootstrap;

class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      listings: [
        {
          categoryName: "Education",
          opportunityTitle: "title",
          charityName: "charity",
          timeString: "every. single. day.",
        },
        {
          categoryName: "Law",
          opportunityTitle: "new title",
          charityName: "another charity",
          timeString: "never",
        },
      ],
    };
  }

  render() {
    return (
      <div className="container">
        <div className="row mt-3">
          <div className="col-lg-4 mx-auto">
            <Image
              className="mx-auto d-block"
              alt="Cybervolunteers promotion"
              src="../IMG/oxfamShop.jpg"
              rounded
            />
          </div>
          <div className="col container first-lines-container">
            <div className="mx-auto">
              <span className="row text-right">
                <span className="col main-header-text">
                  <span className="grey-text thin-text">Connecting</span>
                  <span className="green-text thick-text pl-3">People</span>
                </span>
                <span className="col-2"></span>
              </span>
              <span className="row text-right">
                <span className="col main-header-text">
                  <span className="grey-text thin-text">with</span>
                  <span className="blue-text thick-text pl-3">Purpose</span>
                </span>
                <span className="col-2"></span>
              </span>
              <span className="row text-right">
                <span className="col"></span>
                <span className="col-lg-6">
                  {/* The sub-header */}
                  <span className="dark-grey-text main-subheading-text">
                    underneath just write some filler stuff doesnt rly matter we
                    change it later
                  </span>
                </span>
                <span className="col-lg-2"></span>
              </span>
            </div>
          </div>
        </div>

        <Alert variant={"warning"} className="mt-3">
          <Alert.Heading> Attention, charities:</Alert.Heading>
          <p>
            Pupils from Brighton College are volunteering between 9th and 25th
            June. Groups of 6-10 students in year 11 or 13 are available to help
            under teacher supervision, with transport being arranged by the
            school.
          </p>
          <p>
            If you are a charity that could use the help please email
            hello@cybervolunteers.org.uk.
          </p>
        </Alert>

        <div className="youtube-video">
          <h2 className="mx-auto text-center header">Hey! You! Yes, you!</h2>
          <p className="mx-auto text-center">
            Come 'ere and take a look at what we do! There is a promotional
            video there 'n stuff...
          </p>
          <p className="embedded-youtube-video-container embed-responsive embed-responsive-16by9">
            <iframe
              className="rounded embedded-video embed-responsive-item d-block mx-auto"
              src="https://www.youtube-nocookie.com/embed/inQvLaV-rCM"
              title="YouTube video player"
              frameBorder="0"
              allow="picture-in-picture"
              allowFullScreen
            ></iframe>
          </p>
        </div>

        {/* Examples of listings */}
        {/* <div className="container listings-examples">
          <h2 className="mx-auto text-center header">Listings?</h2>
          <p className="mx-auto text-center">
            What about some listings? No? Well, too bad because we have plenty
            just below!
          </p>

          <Carousel>
            {this.state.listings.map((item, index) => (
              <Carousel.Item key={index}>
                <Card style={{ width: "18rem" }}>
                  <Card.Img variant="top" src="holder.js/100px180" />
                  <Card.Body>
                    <Card.Title>Card Title</Card.Title>
                    <Card.Text>
                      Some quick example text to build on the card title and
                      make up the bulk of the card's content.
                    </Card.Text>
                    <Button variant="primary">Go somewhere</Button>
                  </Card.Body>
                </Card>
              </Carousel.Item>
            ))}
          </Carousel>
        </div> */}
      </div>
    );
  }
}

const domContainer = document.querySelector("#pageContainer");
ReactDOM.render(e(Homepage), domContainer);
