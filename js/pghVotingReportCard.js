$(function()
{
	(function(global)
	{
		var jsonData;

		var voterTurnoutTemplate = '<tr>';
		voterTurnoutTemplate += '<td>{district}</td>';
		voterTurnoutTemplate += '<td class="right">{registeredVoters}</td>';
		voterTurnoutTemplate += '<td class="right">{ballotsCast}</td>';
		voterTurnoutTemplate += '<td class="right"><span class="{gradeCls}">{grade}</span></td>';
		voterTurnoutTemplate += '</tr>';

		var summaryTemplate = '<p>In <span class="label label-info">{year}</span>, Allegheny County had <span class="label label-info">{registeredVoters}</span> registered voters with <span class="label label-info">{ballotsCast}</span> ballots cast giving it a total voter turnout of <span class="{voterTurnoutCls}">{voterTurnout}%</span>. <span class="{gradeCls}">{grade}</span></p>';

		// respond to the navbar tabs
		$('#yearNav a').click(function(e)
		{
			e.preventDefault();

			var target = $(e.currentTarget);
			var rendered = target.data().rendered;
			var year = String(target.data().year);
			var fieldNames = {};

			if(rendered == false)
			{
				target.data().rendered = true;

				switch (year)
				{
					case '2012' :
					{
						fieldNames.turnout = '2012 Turnout';
						fieldNames.registeredVoters = '2012 Registered voters';
						fieldNames.ballotsCast = '2012 Ballots cast';
						break;
					}
					case '2010' :
					{
						fieldNames.turnout = '2010 Turnout';
						fieldNames.registeredVoters = '2010 Registered voters';
						fieldNames.ballotsCast = '2010 Ballots cast';
						break;
					}
					case '2008' :
					{
						fieldNames.turnout = '2008 Turnout';
						fieldNames.registeredVoters = '2008 Registered voters';
						fieldNames.ballotsCast = '2008 Ballots cast';
						break;
					}
				}

				writeData(fieldNames.turnout, fieldNames.registeredVoters, fieldNames.ballotsCast, $(e.currentTarget).attr('href'), year);
			}
		});

		function t(s, d){
		 	for(var p in d)
		   		s=s.replace(new RegExp('{'+p+'}','g'), d[p]);
		 	return s;
		};


		$.ajax({
			dataType: "json",
			url: './js/alleghenyCountyTurnoutAndTopTicketRace_2008-2010-2012.json',
			success: success
		});

		function success(data)
		{
			jsonData = data;
			$('#yearNav a').first().trigger('click');
		};

		function getGradeAndBadgeCls(voterTurnout)
		{
			var gradeCls;
			var grade;

			if(voterTurnout > .9)
			{
				gradeCls = 'success'
				grade = 'a';
			}
			else if(voterTurnout > .8 && voterTurnout < .89)
			{
				gradeCls = 'success'
				grade = 'b';
			}
			else if(voterTurnout > .7 && voterTurnout < .79)
			{
				gradeCls = 'warning'
				grade = 'c';
			}
			else if(voterTurnout > .6 && voterTurnout < .69)
			{
				gradeCls = 'warning'
				grade = 'd';
			}
			else
			{
				gradeCls = 'important'
				grade = 'f';
			}

			return {
				grade: grade,
				gradeCls: gradeCls
			}
		};

		function addCommas(number)
		{
			return String(number).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"); 
		}

		function writeData(turnoutFieldName, registeredVotersFieldName, ballotsCastFieldName, containerId, year)
		{
			var voterTurnoutHTML;
			var totalRegisteredVoters = 0;
			var totalBallotsCast = 0;

			$.each(jsonData, function(i, item)
			{
				var voterTurnout = Number(item[turnoutFieldName]);
				var district = item.District;
				var registeredVoters = Number(item[registeredVotersFieldName]);
				var ballotsCast = Number(item[ballotsCastFieldName]);
				var gradeData = getGradeAndBadgeCls(voterTurnout);

				totalRegisteredVoters += registeredVoters;
				totalBallotsCast += ballotsCast;

				voterTurnoutHTML += t(voterTurnoutTemplate, 
				{
					district: district,
					registeredVoters: addCommas(registeredVoters),
					ballotsCast: addCommas(ballotsCast),
					gradeCls: 'badge badge-' + gradeData.gradeCls,
					grade: gradeData.grade,
					voterTurnout: Math.round(voterTurnout * 100)
				});
			});

			var totalVoterTurnout = totalBallotsCast / totalRegisteredVoters;
			var summaryGradeData = getGradeAndBadgeCls(totalVoterTurnout);
			var summary = t(summaryTemplate, {
				registeredVoters: addCommas(totalRegisteredVoters),
				ballotsCast: addCommas(totalBallotsCast),
				year: year,
				gradeCls: 'badge badge-' + summaryGradeData.gradeCls,
				grade: summaryGradeData.grade,
				voterTurnoutCls: 'label label-' + summaryGradeData.gradeCls,
				voterTurnout: Math.round(totalVoterTurnout * 100)
			})

			$(containerId).prepend(summary);
			$('.voterResults', containerId).append(voterTurnoutHTML);
		}

	}(window));

});