async function drawLineChart() {
  const dataset = await d3
    .json(
      'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json'
    )
    .then((res) => res)

  const timeFormat = d3.timeFormat('%M:%S')
  // takes a data point and returns the time as a date that we can format
  const yAccessor = (d) => {
    let parsed = d.Time.split(':')
    return new Date(Date.UTC(1970, 0, 1, 0, parsed[0], parsed[0]))
  }
  // takes a data point and returns the year
  const xAccessor = (d) => d.Year

  let dimensions = createDimensions()

  // create scale for y axis - get min & max values and pixel range
  const yScale = d3
    .scaleTime()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.boundedHeight, 0])

  // get x axis min & max values
  const xMin = d3.min(dataset, xAccessor)
  const xMax = d3.max(dataset, xAccessor)
  // create scale for x axis - get min & max values and pixel range
  const xScale = d3
    .scaleLinear()
    .domain([xMin - 1, xMax + 1])
    .range([0, dimensions.boundedWidth])

  const colorScale = d3
    .scaleOrdinal()
    .domain(['Doping Allegations', 'No Doping Allegations'])
    .range(['gold', 'white'])
  const legend = d3.legendColor().scale(colorScale).title('Legend')

  d3.select('#wrapper')
    .append('h1')
    .attr('id', 'title')
    .text('Doping In Professional Bike Races')
  // select wrapper and append svg wrapper
  const wrapper = d3
    .select('#wrapper')
    .append('svg')
    .attr('class', 'wrapper')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)
  // append g bounds
  const bounds = wrapper
    .append('g')
    .attr('class', 'bounds')
    .style(
      'transform',
      `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`
    )

  // append legend
  wrapper
    .append('g')
    .attr(
      'transform',
      `translate(${dimensions.boundedWidth - 100}, ${
        dimensions.boundedHeight / 2
      })`
    )
    .call(legend)
    .attr('class', 'legend')
    .attr('fill', '#ffffff')
  // append container for bins
  bounds.append('g').attr('class', 'bins')

  // create one <g> for each item in bins array
  let binGroups = bounds
    .select('.bins')
    .selectAll('.bin')
    .data(dataset)
    .enter()
    .append('g')
    .attr('class', 'bin')

  const circleDots = binGroups
    .append('circle')
    .attr('class', 'dot')
    .attr('r', 7)
    .attr('cx', (d) => xScale(xAccessor(d)))
    .attr('cy', (d) => yScale(yAccessor(d)))
    .attr('data-xvalue', (d) => xAccessor(d))
    .attr('data-yvalue', (d) => yAccessor(d))
    .attr('fill', (d) => colorScale(d.Doping !== ''))

  binGroups
    .select('circle')
    .on('mouseenter', (e, d) => onMouseEnter(e, d))
    .on('mouseleave', onMouseLeave)

  const tooltip = d3.select('#tooltip')
  function onMouseEnter(e, datum) {
    // set opacity
    tooltip.style('opacity', 1)
    // add year data
    tooltip.select('#year').text(datum.Year)
    // add time data
    tooltip.select('#time').text(timeFormat(yAccessor(datum)))

    let x = xScale(xAccessor(datum))
    let y = yScale(yAccessor(datum))
    tooltip
      .style(
        'transform',
        `translate(${x + dimensions.margin.left + 35}px, ${
          y + dimensions.margin.top
        }px)`
      )
      .attr('data-time', yAccessor(datum))
      .attr('data-year', xAccessor(datum))
  }

  function onMouseLeave() {
    tooltip.style('opacity', 0)
  }

  // create y axis generator and pass it our y scale
  const yAxisGenerator = d3.axisLeft().scale(yScale).tickFormat(timeFormat)

  // create <g> element to hold left axis and call yAxisGenerator
  const yAxis = bounds
    .append('g')
    .attr('id', 'y-axis')
    .call(yAxisGenerator)
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', '-9%')
    .attr('x', `-${dimensions.boundedHeight / 2}`)
    .attr('font-size', '1rem')
    .attr('fill', '#e0e2fc')
    .attr('letter-spacing', '2px')
    .text('YEAR')

  // create x axis generator and pass it our x scale
  const xAxisGenerator = d3
    .axisBottom()
    .scale(xScale)
    .tickFormat(d3.format('d'))

  // create <g> element to hold bottom axis and call xAxisGenerator
  const xAxis = bounds
    .append('g')
    .attr('id', 'x-axis')
    .call(xAxisGenerator)
    .style('transform', `translate(0, ${dimensions.boundedHeight}px)`)
    .append('text')
    .attr('x', `${dimensions.boundedWidth / 2}`)
    .attr('y', '7%')
    .attr('font-size', '1rem')
    .attr('fill', '#e0e2fc')
    .attr('letter-spacing', '2px')
    .text('TIME')
}

drawLineChart()

function formatDate(inputDate) {
  var date = new Date(inputDate)
  if (!isNaN(date.getTime())) {
    // Months use 0 index.
    return date.getMonth() + 1 + '-' + date.getDate() + '-' + date.getFullYear()
  }
}

function createDimensions() {
  // draw chart
  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 500,
    margin: {
      top: 15,
      right: 15,
      bottom: 60,
      left: 90,
    },
  }

  // compute bounds dimensions by subtracting margins
  dimensions.boundedWidth =
    dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.boundedHeight =
    dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  return dimensions
}
