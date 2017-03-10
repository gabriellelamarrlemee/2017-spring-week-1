//Set up a drawing environment
var m = {t:50,r:50,b:50,l:50},
		w = document.getElementById('plot1').clientWidth - m.l - m.r,
		h = document.getElementById('plot1').clientHeight - m.t - m.b;

var plot = d3.select('.plot')
    .append('svg')
    .attr('width', w + m.l + m.r)
    .attr('height', h + m.t + m.b)
    .append('g').attr('class','canvas')
    .attr('transform','translate('+ m.l+','+ m.t+')');

//Scales etc.
var scaleColor = d3.scaleOrdinal().range(d3.schemeCategory20);
//scales for the bump chart
var x = d3.scalePoint().range([0,w],.5),
		y = {};

//line generator
var line = d3.line(),
		axis = d3.axisLeft(),
		background,
		foreground;

//import data
d3.queue()
	.defer(d3.csv,'./data/SchoolData_050717.csv',parseData)
	.await(dataLoaded);

	function dataLoaded(err, data){
		var cf = crossfilter(data);
		var schoolsByType = cf.dimension(function(d){return d.type});
		var allSchools = schoolsByType.filter(null).top(Infinity);
		var Neighborhood = schoolsByType.filter('Neighborhood').top(Infinity);
		var schoolsByRating = cf.dimension(function(d){return d.rating});
		var schoolsByProbation = cf.dimension(function(d){return d.probation_status});

		//console.log(Neighborhood);

		//extract the list of dimensions and create a scale for each
		x.domain(dimensions = d3.keys(data[0]).filter(function(d){
			return d != 'name' && (y[d] = d3.scaleLinear()
							.domain(d3.extent(data,function(p){ return +p[d]; }))
							.range([h,0]));
		}));

		//function to return the path for a given data point
		function path(d){
			return line(dimensions.map(function(p){return [x(p),y[p](d[p])];}));
		}

		//add gray background lines for context
		background = plot.append('g')
				.attr('class','background')
				.selectAll('path')
				.data(data)
				.enter().append('path')
				.attr('d',path);

		//add blue foreground lines for focus
		foreground = plot.append('g')
				.attr('class','foreground')
				.selectAll('path')
				.data(data)
				.enter().append('path')
				.attr('d',path);

		//add a group element for each dimension
		var g = plot.selectAll('.dimension')
				.data(dimensions)
				.enter().append('g')
				.attr('class','dimension')
				.attr('transform',function(d){return 'translate(' + x(d) + ')';});

		//add axis and title
		g.append('g')
				.attr('class','axis')
				.each(function(d){d3.select(this).call(axis.scale(y[d]));})
				.append('text')
				.attr('text-anchor','middle')
				.attr('y',-9)
				.text(String);



		//benchmark numbers **TO DO: Add in a median line**
		var avgStudents = d3.mean(data,function(d) { return d.students}),
				medianStudents = d3.median(data,function(d){return d.students}),
				// avgRating = /*fill with correct info*/,
				// avgProbationStatus = /*fill with correct info*/,
				avgAsian = d3.mean(data,function(d) { return d.asian_pct}),
				avgBlack = d3.mean(data,function(d) { return d.black_pct}),
				avgHispanic = d3.mean(data,function(d) { return d.hispanic_pct}),
				avgWhite = d3.mean(data,function(d) { return d.white_pct}),
				avgOther = d3.mean(data,function(d) { return d.other_pct}),
				avgLowIncome = d3.mean(data,function(d) { return d.low_income_pct}),
				avgDiverseLearners = d3.mean(data,function(d) { return d.diverse_learners_pct}),
				avgLimitedEnglish = d3.mean(data,function(d) { return d.limited_english_pct}),
				avgMobilityRate = d3.mean(data,function(d) { return d.mobility_rate_pct}),
				avgChronicTruancy = d3.mean(data,function(d) { return d.chronic_truancy_pct});

		// console.log('Average students: ' + avgStudents);
		// console.log('Median students: ' + medianStudents);
		// console.log('Average chronic truancy: ' + avgChronicTruancy);
		// console.log('Average asian: ' + avgAsian);
		// console.log('Average black: ' + avgBlack);

		/*//this is the pie chart
		//pie chart data transformation
    var nestedByType = d3.nest()
        .key(function(d){return d.type})
        .entries(data);

	  var arc = d3.arc()
	      .startAngle(function(d){ return d.startAngle })
	      .endAngle(function(d){ return d.endAngle })
	      .innerRadius(10)
	      .outerRadius(30);

    //pie layout   -->  data transformation
    var pie = d3.pie()
        .value(function(d){ return d.values.length });

    //draw the slices
    var slices = plot.selectAll('path')
        .data(pie(nestedByType))
        .enter()
        .append('path')
        .attr('d',arc)
        .attr('transform','translate('+w/2+','+h/2+')')
        .style('fill', function(d,i){return scaleColor(i);})*/

	}


function parseData(d){
	return {
		name:d.name,
		//street_address:d.street_address,
		//city:d.city,
		//state:d.state,
		//zip:d.zip,
		//id:d.id?d.id:undefined,
		//grades:d.grades,
		//type:d.type,
		students:+d.students,
		//rating:d.rating,
		//probation_status:d.probation_status,
		asian_pct:+d.asian,
		black_pct:+d.black,
		hispanic_pct:+d.hispanic,
		white_pct:+d.white,
		other_pct:+d.other,
		low_income_pct:+d.low_income,
		diverse_learners_pct:+d.diverse_learners,
		limited_english_pct:+d.limited_english,
		mobility_rate_pct:+d.mobility_rate
		//chronic_truancy_pct:+d.chronic_truancy
	}
}
