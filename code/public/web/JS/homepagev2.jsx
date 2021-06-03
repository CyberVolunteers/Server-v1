"use strict";

const e = React.createElement;
const listingsPerSlide = 4;
const maxListingPages = 2;
const categoriesPerSlide = 4;
const maxCategoriesPages = 2;

// TODO: add a Jumbotron
const { Alert, Image, Modal, Button, Carousel, Card } = ReactBootstrap;

class SeeMoreFiller {}

class MultipleItemCarousel extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Carousel
        nextLabel={null}
        prevLabel={null}
        indicators={false}
        interval={null}
        className={`multiple-item-carousel ${this.props.className}`}
      >
        {splitIntoGroups(
          this.props.items,
          this.props.itemsPerSlide,
          this.props.maxItemsPages
        ).map((slideItems, slideIdex) => (
          <Carousel.Item key={slideIdex} className="container">
            <div className="row g-2 justify-content-around">
              {slideItems.map((item, index) => {
                const InnerComponent =
                  item instanceof SeeMoreFiller
                    ? this.props.seeMoreComponent
                    : this.props.normalItemComponent;
                return (
                  <InnerComponent
                    key={index}
                    item={item}
                    className=""
                  ></InnerComponent>
                );
              })}
            </div>
          </Carousel.Item>
        ))}
      </Carousel>
    );
  }
}

class Homepage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      categories: [
        "Advocacy & Human Rights",
        "Arts & Culture",
        "Community",
        "Computers & Technology",
        "Education",
        "Healthcare & Medicine",
        "Elderly",
        "Law",
        "Test",
      ],
      listings: [
        {
          uuid: "ed6ea111-8c20-11eb-afb8-dadd5bd8c1d2",
          categoryName: "Education",
          opportunityTitle: "title",
          charityName: "charity",
          timeString: "every. single. day.",
          description: "description",
        },
        {
          uuid: "fee7553a-b17f-11eb-afb8-dadd5bd8c1d2",
          categoryName: "Law",
          opportunityTitle: "new title",
          charityName: "another charity",
          timeString: "never",
          description: "desc",
        },
        {
          uuid: "fee7553a-b17f-11eb-afb8-dadd5bd8c1d2",
          categoryName: "A",
          opportunityTitle: "B",
          charityName: "C",
          timeString: "D",
          description: "E",
        },
        {
          uuid: "fee7553a-b17f-11eb-afb8-dadd5bd8c1d2",
          categoryName: "A2",
          opportunityTitle: "B2",
          charityName: "C2",
          timeString: "D2",
          description: "E2",
        },
        {
          uuid: "fee7553a-b17f-11eb-afb8-dadd5bd8c1d2",
          categoryName: "A3",
          opportunityTitle: "B3",
          charityName: "C3",
          timeString: "D3",
          description: "E3",
        },
        {
          uuid: "fee7553a-b17f-11eb-afb8-dadd5bd8c1d2",
          categoryName: "A4",
          opportunityTitle: "B4",
          charityName: "C4",
          timeString: "D4",
          description: "E4",
        },
        {
          uuid: "fee7553a-b17f-11eb-afb8-dadd5bd8c1d2",
          categoryName: "A5",
          opportunityTitle: "B5",
          charityName: "C5",
          timeString: "D5",
          description: "E5",
        },
        {
          uuid: "fee7553a-b17f-11eb-afb8-dadd5bd8c1d2",
          categoryName: "A6",
          opportunityTitle: "B6",
          charityName: "C6",
          timeString: "D6",
          description: "E6",
        },
        {
          uuid: "fee7553a-b17f-11eb-afb8-dadd5bd8c1d2",
          categoryName: "I'm way too lazy",
          opportunityTitle: "to fill",
          charityName: "all this out",
          timeString: "Oh wait",
          description: "Oh no no",
        },
      ],
    };
  }

  render() {
    return (
      <div className="container">
        <div className="row mt-3 mb-5">
          <div className="col-lg-2"></div>
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
              <span className="row">
                <span className="col main-header-text">
                  <span className="grey-text thin-text">Connecting</span>
                  <span className="green-text thick-text p-3">People</span>
                </span>
                <span className="col-2"></span>
              </span>
              <span className="row text-right">
                <span className="col main-header-text">
                  <span className="grey-text thin-text">with</span>
                  <span className="blue-text thick-text p-3">Purpose</span>
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

        {/* <Alert variant={"warning"} className="mt-3">
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
        </Alert> */}

        {/* Examples of listings */}
        <div className="container listings-examples large-margin">
          <h2 className="mx-auto text-center header">Listings?</h2>
          <p className="mx-auto text-center">
            What about some listings? No? Well, too bad because we have plenty
            just below!
          </p>

          <MultipleItemCarousel
            className="category-carousel"
            itemsPerSlide={categoriesPerSlide}
            maxItemsPages={maxCategoriesPages}
            items={this.state.categories}
            seeMoreComponent={() => (
              <div className="col-lg-3">
                <Button
                  variant="outline-info"
                  className="category-box mx-auto d-block"
                >
                  And More!
                </Button>
              </div>
            )}
            normalItemComponent={(props) => {
              return (
                <div className="col-lg-3">
                  <Button
                    variant="outline-dark"
                    className="category-box mx-auto d-block"
                  >
                    {props.item}
                  </Button>
                </div>
              );
            }}
          ></MultipleItemCarousel>

          <MultipleItemCarousel
            itemsPerSlide={listingsPerSlide}
            maxItemsPages={maxListingPages}
            items={this.state.listings}
            seeMoreComponent={() => {
              return (
                <div className="col-lg-3">
                  <Card
                    className="mx-auto"
                    // style={{ width: "18rem" }}
                  >
                    <Card.Body>
                      <Card.Title>And many more!</Card.Title>
                      <Button href={`./listingsPage`} variant="primary">
                        See more listings
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              );
            }}
            normalItemComponent={(props) => {
              const { item } = props;
              return (
                <div className="col-lg-3">
                  <Card
                    className="mx-auto"
                    // style={{ width: "18rem" }}
                  >
                    <Card.Body>
                      <Card.Title>{item.opportunityTitle}</Card.Title>
                      <Card.Text>{item.description}</Card.Text>
                      <Button
                        href={`./listing?uuid=${item.uuid}`}
                        variant="primary"
                      >
                        I want to help
                      </Button>
                    </Card.Body>
                  </Card>
                </div>
              );
            }}
          ></MultipleItemCarousel>
        </div>

        <div className="youtube-video large-margin">
          <h2 className="mx-auto text-center header">Hey! You! Yes, you!</h2>
          <p className="mx-auto text-center">
            Come 'ere and take a look at what we do! There is a promotional
            video here 'n stuff...
          </p>
          <p className="embedded-youtube-video-container ratio ratio-16x9">
            <iframe
              className="rounded embedded-video d-block mx-auto"
              src="https://www.youtube-nocookie.com/embed/inQvLaV-rCM"
              title="YouTube video player"
              frameBorder="0"
              allow="picture-in-picture"
              allowFullScreen
            ></iframe>
          </p>
        </div>
      </div>
    );
  }
}

function splitIntoGroups(array, numberPerPage, maxPages) {
  let groups = [[]];
  let currentIndex = 0;
  let lastItemIndex = 0;
  for (let itemIndex in array) {
    let item = array[itemIndex];
    // if the group is full already
    if (groups[currentIndex].length === numberPerPage) {
      currentIndex++;
      if (currentIndex > maxPages - 1) break; // if would go over the page number, abort
      groups.push([]);
    }
    groups[currentIndex].push(item);
    lastItemIndex = itemIndex;
  }
  // replace the last object with a filler, but only if there is more to see
  if (lastItemIndex == array.length - 1) return groups;

  let lastSlide = groups[groups.length - 1];
  lastSlide[lastSlide.length - 1] = new SeeMoreFiller();
  return groups;
}

const domContainer = document.querySelector("#pageContainer");
ReactDOM.render(e(Homepage), domContainer);
