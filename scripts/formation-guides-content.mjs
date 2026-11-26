// Text for the formation guide pages (formations/*.html).
// Each entry: [summary, strengths, watch out for, best for]
export const FORMATS = [
  {
    slug: '5-a-side', page: '5s.html', key: 'FORMATIONS_5V5', game: '5v5', players: 5,
    title: '5-a-side Formations',
    intro: 'Five-a-side is about movement more than shape: with a keeper and four outfield players, everyone attacks and everyone defends. These are the shapes most teams use, from the solid 2-2 to the all-out 1-3.',
    formations: {
      '22': ['Two at the back, two up front. The simplest and most popular 5-a-side shape.', 'Easy to understand, covers the pitch evenly, always two players back.', 'The middle can be empty, so midfield runners need to drop in.', 'New groups and casual weekly games.'],
      '211': ['A diamond: two defenders, one midfielder and a lone striker.', 'Strong defensive base and a clear link player in the middle.', 'The striker can get isolated if the midfielder does not push up.', 'Teams with one confident finisher.'],
      '121': ['The classic diamond: one defender, two wide midfielders, one striker.', 'Great width and passing angles, ideal for keeping the ball.', 'Only one natural defender, so the wide players must track back.', 'Fit, technical teams who like to pass.'],
      '112': ['One defender, one holding player and a front two.', 'Two strikers keep the opposition busy and press high.', 'Exposed on the counter if the holder is beaten.', 'Teams chasing goals.'],
      '31': ['Three defenders and one striker.', 'Very hard to break down; good for protecting a lead.', 'Few options going forward, the striker needs to hold the ball up.', 'Defending a lead or facing a stronger side.'],
      '13': ['One defender behind a front three.', 'Maximum pressure high up the pitch and lots of shooting chances.', 'Very open at the back; the keeper becomes a sweeper.', 'Late in the game when you need a goal.'],
      '202': ['Two defenders and two forwards with no fixed midfield.', 'Clear roles: two stay, two go.', 'The gap in the middle means lots of long balls.', 'Physical games and big pitches.']
    }
  },
  {
    slug: '6-a-side', page: '6s.html', key: 'FORMATIONS_6V6', game: '6v6', players: 6,
    title: '6-a-side Formations',
    intro: 'With five outfield players, 6-a-side lets you have a real defence, a midfield and an attack. Most teams play a 2-2-1 or a 2-1-2; pick the one that suits who turns up.',
    formations: {
      '221': ['Two defenders, two midfielders and a striker. The balanced default.', 'Every area of the pitch is covered and roles are easy to explain.', 'The striker has to work hard to press on their own.', 'Most pickup and league games.'],
      '131': ['A sweeper, three midfielders and a striker.', 'Controls the middle of the pitch and keeps possession.', 'Wide defenders are missing, so the side midfielders must drop back.', 'Teams with good passers.'],
      '212': ['Two defenders, one central midfielder and two strikers.', 'Two up top gives a constant goal threat.', 'The single midfielder gets outnumbered in the middle.', 'Attacking teams with a strong holding player.'],
      '122': ['One defender, two midfielders and two forwards.', 'Lots of attacking options and a high press.', 'Thin at the back; counter-attacks hurt.', 'Chasing a game or playing a weaker side.'],
      '311': ['Three defenders, a midfielder and a striker.', 'Solid and hard to score against.', 'Hard to create chances with only two players forward.', 'Protecting a lead.']
    }
  },
  {
    slug: '7-a-side', page: '7s.html', key: 'FORMATIONS_7V7', game: '7v7', players: 7,
    title: '7-a-side Formations',
    intro: '7-a-side is the standard format for youth football and a favourite for Sunday leagues. Six outfield players give you enough to build proper lines, and the 2-3-1 is the most used shape by far.',
    formations: {
      '231': ['Two defenders, three midfielders and a striker. The most popular 7-a-side shape.', 'Balanced, strong in midfield, easy for young players to learn.', 'Wide midfielders need the legs to help the two defenders.', 'Almost any team; the best starting point.'],
      '321': ['Three at the back, two midfielders and a striker.', 'Very secure defensively with cover across the pitch.', 'Can feel short of attacking players.', 'Facing strong attackers or defending a lead.'],
      '132': ['A sweeper, three midfielders and two strikers.', 'Attacks with numbers and presses high.', 'One defender leaves big gaps on the counter.', 'Dominant teams that keep the ball.'],
      '222': ['Two defenders, two midfielders, two forwards.', 'Simple and symmetrical, everyone has a partner.', 'Can be outnumbered in midfield by a 2-3-1.', 'Casual games and mixed-ability groups.'],
      '141': ['One defender, four midfielders and a striker.', 'Floods the middle and wins the ball back quickly.', 'Needs a disciplined lone defender and runners from midfield.', 'Possession-based teams.'],
      '312': ['Three defenders, one holding midfielder and two strikers.', 'Solid base plus two forwards to stretch the defence.', 'The lone midfielder covers a lot of ground.', 'Direct, counter-attacking teams.'],
      '213': ['Two defenders, one midfielder and a front three.', 'Lots of width and shots in the final third.', 'Leaves the midfield thin.', 'When you need goals.']
    }
  },
  {
    slug: '8-a-side', page: '8s.html', key: 'FORMATIONS_8V8', game: '8v8', players: 8,
    title: '8-a-side Formations',
    intro: '8-a-side sits between small-sided and full football: seven outfield players let you play with real width. The 2-3-2 and 3-2-2 are the most common choices.',
    formations: {
      '232': ['Two defenders, three midfielders and two forwards.', 'Strong in the middle with a front pair to finish moves.', 'Full-back areas are open, so wide midfielders must recover.', 'Balanced teams; a great default.'],
      '322': ['Three defenders, two midfielders and two forwards.', 'Secure at the back while keeping two attackers.', 'Midfield can be outnumbered.', 'Teams that defend first and counter.'],
      '241': ['Two defenders, four midfielders and a striker.', 'Controls possession and the width of the pitch.', 'The lone striker needs support from midfield runners.', 'Technical teams.'],
      '331': ['Three defenders, three midfielders and a striker.', 'Very hard to break down and still solid in midfield.', 'Limited attacking numbers.', 'Facing stronger opposition.'],
      '223': ['Two defenders, two midfielders and a front three.', 'Wide forwards stretch the defence and create chances.', 'Exposed through the middle on the counter.', 'Attacking teams with quick wingers.']
    }
  },
  {
    slug: '9-a-side', page: '9s.html', key: 'FORMATIONS_9V9', game: '9v9', players: 9,
    title: '9-a-side Formations',
    intro: '9-a-side is the bridge to the full game for many youth players. Eight outfield players allow back threes and back fours, so it is a good format to learn proper tactics.',
    formations: {
      '332': ['Three defenders, three midfielders and two forwards.', 'Balanced across every line with a strike partnership.', 'Wide areas can be exposed if the outside midfielders push on.', 'Most teams; the most common 9v9 shape.'],
      '323': ['Three defenders, two midfielders and a front three.', 'Wide attackers give width and lots of crosses.', 'Two in midfield can be overrun.', 'Teams with quick wide players.'],
      '431': ['A back four, three midfielders and a striker.', 'Very solid and mirrors the 11-a-side 4-3-3 shape.', 'The lone striker needs midfield support.', 'Teams preparing for 11-a-side.'],
      '422': ['A back four, two midfielders and two forwards.', 'Familiar shape, simple roles, two strikers.', 'Midfield pair has a lot of ground to cover.', 'Direct teams with a good front two.'],
      '341': ['Three defenders, four midfielders and a striker.', 'Dominates midfield and keeps the ball.', 'Needs fit wide midfielders to support attack and defence.', 'Possession teams.'],
      '3221': ['Three at the back, two holding midfielders, two attacking midfielders and a striker.', 'Plenty of creative players between the lines.', 'Can be narrow; needs movement wide.', 'Technical teams who play through the middle.'],
      '242': ['Two defenders, four midfielders and two forwards.', 'Lots of bodies forward and in midfield.', 'Only two defenders, so it is risky on the counter.', 'Chasing a game.']
    }
  },
  {
    slug: '10-a-side', page: '10s.html', key: 'FORMATIONS_10V10', game: '10v10', players: 10,
    title: '10-a-side Formations',
    intro: '10-a-side is common in leagues and pickup games when one player short of a full team. These shapes are the full-size classics with one player removed.',
    formations: {
      '432': ['A back four, three midfielders and two strikers.', 'Solid defence and a strike partnership.', 'Narrow without wingers, so full-backs must push on.', 'Most 10-a-side games.'],
      '342': ['Three defenders, four midfielders and two strikers.', 'Strong in midfield with two up front.', 'Wing areas behind the midfield can be exposed.', 'Teams with fit wide midfielders.'],
      '423': ['A back four, two midfielders and a front three.', 'Wide attackers and a striker give a constant threat.', 'Two midfielders can be outnumbered.', 'Attacking teams with quick wingers.'],
      '333': ['Three defenders, three midfielders and three forwards.', 'Even across the pitch with lots of attacking options.', 'Gaps between the lines if players do not stay compact.', 'Open, high-scoring games.']
    }
  },
  {
    slug: '11-a-side', page: 'index.html', key: 'FORMATIONS_11V11', game: '11v11', players: 11,
    title: '11-a-side Formations',
    intro: 'The full game has the most tactical variety. Here is every formation in the builder, from the classic 4-4-2 and modern 4-3-3 to historical shapes like the 2-3-5.',
    formations: {
      '442': ['Four defenders, four midfielders, two strikers. The classic English formation.', 'Simple, balanced and easy for any group to understand.', 'Can be outnumbered in central midfield.', 'Amateur and Sunday league teams.'],
      '433': ['A back four, three central midfielders and a front three.', 'Width from the wingers and control in midfield.', 'Full-backs must cover the wide areas behind the wingers.', 'Possession teams; the most common elite shape.'],
      '4231': ['Back four, two holding midfielders, three attacking midfielders and a striker.', 'Defensive security with lots of creative players.', 'The lone striker needs strong support.', 'Balanced teams with a good number 10.'],
      '352': ['Three centre-backs, five midfielders including wing-backs, two strikers.', 'Dominates midfield and gives width through the wing-backs.', 'Wing-backs need huge stamina.', 'Teams with two good strikers and fit wide players.'],
      '343': ['Three at the back, four in midfield and three forwards.', 'Very attacking with overloads out wide.', 'Exposed to counter-attacks if wing-backs push up.', 'Dominant, high-pressing teams.'],
      '532': ['Five defenders, three midfielders and two strikers.', 'Hard to break down with two outlets up front.', 'Can be passive and give away possession.', 'Underdogs and protecting a lead.'],
      '451': ['Back four, five midfielders and a lone striker.', 'Packs the midfield and is difficult to play through.', 'Few players in the box.', 'Away games and tough opponents.'],
      '541': ['Five defenders, four midfielders and one striker.', 'The most defensive common shape.', 'Hard to create chances.', 'Holding on to a result.'],
      '4141': ['Back four, a holding midfielder, a line of four and a striker.', 'Screens the defence and presses well in midfield.', 'The striker can be isolated.', 'Teams with a strong defensive midfielder.'],
      '3421': ['Three at the back, four midfielders, two inside forwards and a striker.', 'Creative players between the lines with wing-back width.', 'Needs disciplined wing-backs.', 'Technical, possession teams.'],
      '4321': ['The Christmas tree: back four, three midfielders, two attacking midfielders, one striker.', 'Very strong through the middle.', 'Narrow; full-backs provide all the width.', 'Teams with creative central players.'],
      '41212': ['The midfield diamond: back four, a holder, two shuttlers, a number 10 and two strikers.', 'Controls the centre and supports a front two.', 'No natural width.', 'Teams with strong central midfielders.'],
      '4132': ['Back four, a holding midfielder, three midfielders and two strikers.', 'Two strikers plus a protected defence.', 'Wide areas need full-back support.', 'Direct teams with a front pair.'],
      '4213': ['Back four, two holding midfielders, a number 10 and a front three.', 'Lots of attackers with a solid base.', 'Gaps between midfield and attack.', 'Attacking teams with quick wingers.'],
      '523': ['Five defenders, two midfielders and three forwards.', 'Secure at the back with a strong counter-attack.', 'Thin in midfield.', 'Counter-attacking teams with fast forwards.'],
      '4312': ['Back four, three midfielders, a number 10 and two strikers.', 'Great central control and a creative link to the strikers.', 'Narrow without wingers.', 'Teams with a playmaker.'],
      '334': ['Three defenders, three midfielders and four forwards.', 'All-out attack with numbers in the box.', 'Very open defensively.', 'Chasing a game late on.'],
      '460': ['Back four and six midfielders with no fixed striker.', 'Midfielders rotate into the box and are hard to mark.', 'Needs a lot of movement to score.', 'Experimental, possession-heavy teams.'],
      '5221': ['Five defenders, two holding midfielders, two attacking midfielders and a striker.', 'Very compact and hard to break through.', 'Few attacking options.', 'Defending against stronger teams.'],
      '424': ['Back four, two central midfielders and four attackers.', 'Huge attacking threat with wingers and two strikers.', 'The midfield pair can be overrun.', 'Teams that need goals.'],
      '235': ['The historical pyramid: two defenders, three midfielders, five forwards.', 'A fun look back at football in the 1880s to 1930s.', 'Very exposed at the back by modern standards.', 'Throwback games and history fans.'],
      '325': ['The W-M style: three defenders, two midfielders and five forwards.', 'Lots of attacking players with a back three.', 'Thin midfield.', 'Throwback and fun games.'],
      '253': ['Two defenders, five midfielders and three forwards.', 'Overloads midfield with an attacking front three.', 'Only two defenders.', 'Dominant teams that keep the ball.']
    }
  }
];
