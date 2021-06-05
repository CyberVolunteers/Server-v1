"use strict";

const e = React.createElement;
const categoriesPerSlide = 4;
const maxCategoriesPages = 2;
const listingsPerSlide = screen.width > 992 ? 3 : 1; // bootstrap breakpoint
const maxListingPages = screen.width > 992 ? 2 : 4;

const maxCharactersListingDesc = 100;
const maxCharactersListingTitle = 50;

// TODO: add a Jumbotron
const {
  Alert,
  Image,
  Modal,
  Button,
  Carousel,
  Card,
  Navbar,
  Nav,
  NavDropdown,
} = ReactBootstrap;

class SeeMoreFiller {}

class CustomNavbar extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="/">Home</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="/contactUsLinks">Contact</Nav.Link>
            <Nav.Link href="/aboutUs">About</Nav.Link>
            <Nav.Link href="/listingsPage">Search listings</Nav.Link>
          </Nav>
          <Nav>
            {window.isLoggedIn ? (
              <Nav.Link href="/myAccount">My Account</Nav.Link>
            ) : (
              <React.Fragment>
                <Nav.Link href="/joinUs">Join</Nav.Link>
                <Nav.Link href="/login">Log in</Nav.Link>
              </React.Fragment>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

class MultipleItemCarousel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeIndex: 0,
      isRightButtonActive: true,
      isLeftButtonActive: false,
    };
  }

  updateButtons() {
    if (!this.carouselRef) return;
    for (let element of this.carouselRef.element.children) {
      const className = element.className;
      if (className.includes("prev") || className.includes("next"))
        element.classList.remove("disabled-button");
      if (className.includes("prev") && !this.state.isLeftButtonActive)
        element.classList.add("disabled-button");
      if (className.includes("next") && !this.state.isRightButtonActive)
        element.classList.add("disabled-button");
    }
  }

  render() {
    return (
      <Carousel
        wrap={true} // to enable the buttons
        ref={(ref) => {
          this.carouselRef = ref;
          this.updateButtons();
        }}
        activeIndex={this.state.activeIndex}
        onSelect={(index, evt) => {
          // limit index
          let activeIndex = this.state.activeIndex;
          console.log(evt.target.attributes.class.nodeValue);
          const isLeft = evt.target.attributes.class.nodeValue.includes("prev");
          if (isLeft) index = Math.min(activeIndex, index);
          if (!isLeft) index = Math.max(activeIndex, index);

          let isRightButtonActive = true;
          let isLeftButtonActive = true;
          if (index == 0) isLeftButtonActive = false;
          if (index == this.props.maxItemsPages - 1)
            isRightButtonActive = false;

          this.setState({
            activeIndex: index,
            isLeftButtonActive,
            isRightButtonActive,
          });

          console.log(isRightButtonActive);

          this.updateButtons();
        }}
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
          categoryName: "test",
          opportunityTitle:
            "Who is this guy? Why is he on every single listing? Here is some filler text just in case",
          charityName: "charity",
          timeString: "every. single. day.",
          description: "description",
        },
        {
          uuid: "fee7553a-b17f-11eb-afb8-dadd5bd8c1d2",
          categoryName: "Law",
          opportunityTitle:
            "Who is this guy? Why is he on every single listing? Here is some filler text just in case",
          charityName: "another charity",
          timeString: "never",
          description:
            "Something incredibly long, you know, just for testing purposes... It is interesting to see how long this can go for.. is it still going?",
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
      <div className="react-page-container container-fluid">
        <CustomNavbar />
        <div className="row large-margin-top mb-5">
          <div className="col-lg-2"></div>
          <div className="col-lg-4 mx-auto align-self-center">
            <div className="youtube-video large-margin">
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
                <span className="col-lg-8">
                  {/* The sub-header */}
                  <span className="dark-grey-text main-subheading-text mt-4">
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
        <div className="container listings-examples large-margin large-margin-top">
          <h2 className="mx-auto text-center header mb-3">Listings?</h2>
          <p className="mx-auto text-center mb-5">
            What about some listings? No? Well, too bad because we have plenty
            just below!
          </p>

          <MultipleItemCarousel
            className="category-carousel mx-auto"
            itemsPerSlide={categoriesPerSlide}
            maxItemsPages={maxCategoriesPages}
            items={this.state.categories}
            seeMoreComponent={() => (
              <div
                className="col-lg-3 category-container"
                style={{ height: "100%" }}
              >
                <div
                  className="d-flex align-items-center justify-content-center"
                  style={{ height: "100px" }}
                >
                  <Button
                    href={`./listingsPage`}
                    variant="outline-primary"
                    className="category-box"
                  >
                    See More!
                  </Button>
                </div>
              </div>
            )}
            normalItemComponent={(props) => {
              return (
                <div
                  className="col-lg-3 category-container"
                  style={{ height: "100%" }}
                >
                  <Button
                    variant="link"
                    className="category-box existing-category mx-auto d-block"
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
                <div className="col-lg-4 listing-container">
                  <Card className="mx-auto listing-box">
                    <Card.Body>
                      <table style={{ height: "100%", width: "100%" }}>
                        <tbody>
                          <tr>
                            <td class="align-middle">
                              <div className="mx-auto">
                                <div>
                                  <Button
                                    href={`./listingsPage`}
                                    variant="link"
                                    className="col-12"
                                  >
                                    View all listings
                                  </Button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </Card.Body>
                  </Card>
                </div>
              );
            }}
            normalItemComponent={(props) => {
              const { item } = props;
              return (
                <div className="col-lg-4 listing-container">
                  <Card
                    style={{ width: "18rem" }}
                    className="mx-auto listing-box"
                  >
                    <Card.Img
                      variant="top"
                      src="../IMG/oxfamShop.jpg"
                      className="mx-auto d-block"
                    />
                    <Card.Body>
                      <Card.Title className="pt-1 listing-title">
                        <span>
                          {truncate(
                            item.opportunityTitle,
                            maxCharactersListingTitle
                          )}
                        </span>
                      </Card.Title>
                      <Card.Text className="pt-1 listing-desc">
                        {truncate(item.description, maxCharactersListingDesc)}
                      </Card.Text>
                      <Button
                        href={`./listing?uuid=${item.uuid}`}
                        className="mx-auto d-block"
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
      </div>
    );
  }
}

function truncate(input, maxLength) {
  return input.length > maxLength
    ? `${input.substring(0, maxLength)}...`
    : input;
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
