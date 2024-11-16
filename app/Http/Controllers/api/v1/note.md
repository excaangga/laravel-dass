// Then save the scores (weight) to DB
// if the user is a client, then:
//      - insert the questionType & methodType to enum, alongside with the user's id & psyTeam's id and 
//          the user's scores on that questionType
//      - user1 on DASS21-OWA of team1 scored 3, 7, 7
// if the user is a psychologist, then:
//      - (from list of all quetionnaires, this guy can join or create a psy group)
//      - insert the user's id to a questionTeam (each has code too), and then use that questionTeam's id
//          alongside questionType & methodType enum, and the scores of that team
//          - scores: entity that gathers the input value of each individual in the team,
//              something that goes like [psy1 on team1] gave 1,2,3 on question 1.
//      - to store the weight itself, it'll go something like this:
//          team1 gave 0.321, ..., ... on question 1.
