const GAMEMASTERS = [
    { id: 1, name: 'John', trained_rooms: [2, 3] },
    { id: 2, name: 'Alice', trained_rooms: [4, 10] },
    { id: 3, name: 'David', trained_rooms: [5] },
    { id: 4, name: 'Emily', trained_rooms: [8, 6, 2, 7] },
    { id: 5, name: 'Michael', trained_rooms: [9, 1, 4, 3, 11, 8, 6, 12] },
    { id: 6, name: 'Sophia', trained_rooms: [7, 10] },
    { id: 7, name: 'Daniel', trained_rooms: [8] },
    { id: 8, name: 'Olivia', trained_rooms: [3, 9] },
    { id: 9, name: 'Matthew', trained_rooms: [2, 6, 1, 7, 3, 4] },
    { id: 10, name: 'Emma', trained_rooms: [5, 4] },
    { id: 11, name: 'James', trained_rooms: [11] },
    { id: 12, name: 'Isabella', trained_rooms: [7, 4, 12] },
    { id: 13, name: 'William', trained_rooms: [11] },
    { id: 14, name: 'Ava', trained_rooms: [9] },
    { id: 15, name: 'Benjamin', trained_rooms: [8, 4] },
    { id: 16, name: 'Mia', trained_rooms: [1, 3, 7, 5, 8] },
    { id: 17, name: 'Ethan', trained_rooms: [4, 2] },
    { id: 18, name: 'Charlotte', trained_rooms: [10] },
    { id: 19, name: 'Alexandre', trained_rooms: [9, 2, 8] },
    { id: 20, name: 'Harper', trained_rooms: [1, 12] }
]

const ROOMS = [
    { id: 1, name: "Le Braquage à la francaise" },
    { id: 2, name: "Le Braquage de casino" },
    { id: 3, name: "L'Enlèvement" },
    { id: 4, name: "Le Métro" },
    { id: 5, name: "Les Catacombes" },
    { id: 6, name: "Assassin's Creed" },
    { id: 7, name: "L'Avion" },
    { id: 8, name: "La Mission spatiale" },
    { id: 9, name: "Le Tremblement de terre" },
    { id: 10, name: "Le Cinéma hanté" },
    { id: 11, name: "Le Farwest" },
    { id: 12, name: "Mission secrète" }
]

// Tirage aléatoire des gamemasters
const random_gamemaster_array = size => GAMEMASTERS.sort(() => Math.random() - 0.5).slice(0, size)


const main = () => {
    let gamemasters = random_gamemaster_array(ROOMS.length)
    let sessions = ROOMS.map(room => {return {room: room}})
    let rooms = ROOMS.slice()
    
    /* TODO
    Tu vas devoir attribuer à chaque session un gamemaster en fonction des salles sur lesquelles il est déjà formé.
    Chaque gamemaster ne peut être attribué qu'à une seule session.
    Tu as quartier libre sur la methode, l'objectif ici est de voir comment tu travailles et comment tu te confrontes à ce genre de problème.
    Si le tirage est impossible, tu devras signaler le problème. Sinon tu devras afficher une des solutions.

    /!\ L'annonce stipule que nous cherchons un développeur senior.
    */

    //gamemasters = gamemasters.sort((gmA, gmB) => gmA["trained_rooms"].length - gmB["trained_rooms"].length)//.reduce((a,v) => ({...a, [v.id]:v}), {})//.map( gm => {return {[gm.id]: gm}})
    
    const LOG_LEVEL = {
        "DEBUG": 0,
        "INFO": 1,
        "WARN": 2,
        "ERROR": 3,
        "CRITICAL": 4
    }
    const logger = (logThreshold) => {return (logLevel, logMessage, logObject = null) => {logLevel >= logThreshold ? console.log(`${Object.keys(LOG_LEVEL)[logLevel]} - ${logMessage}`, logObject?logObject:"") : {}}}
    let log = logger(LOG_LEVEL.INFO)

    // Turn gamemasters into map for further gamemaster data lookup
    gamemasters = gamemasters.reduce((a,v) => ({...a, [v.id]:v}), {})
    log(LOG_LEVEL.INFO,"Gamemasters (as map):", gamemasters)

    // Add trained_gamemasters to each escape room
    rooms.forEach((room) => room["trained_gamemasters"] = [])
    Object.entries(gamemasters).forEach(([gmId, gm]) => {

        gm["trained_rooms"].forEach((roomId) => {
            rooms[roomId - 1]["trained_gamemasters"].push(gmId)
        })
    })

    // Turn rooms into map for further addressing
    rooms = rooms.reduce((a,v) => ({...a, [v.id]:v}), {})
    log(LOG_LEVEL.INFO,"Rooms (as map):", rooms)

    //console.log(`Sessions:`, sessions)
    sessions.forEach((session) => {
        session["gamemaster"] = null
        session["gamemaster_candidates"] = session["room"]["trained_gamemasters"]
        session["gamemaster_alternatives"] = [ ]
    })
    sessions = sessions.reduce((a,v) => ({...a, [v.room.id]:v}), {})
    log(LOG_LEVEL.INFO,"Sessions (as map):", sessions)

    let sessionsStates = {
        "impossible": () => {
            let impossibleSessions = []
            Object.entries(sessions).forEach(([sessionId, session]) => {
                (!(session.gamemaster) && (session.gamemaster_candidates.length == 0) && (session.gamemaster_alternatives.length == 0)) ? impossibleSessions.push(sessionId) : {}
            })
            return impossibleSessions
        },
        "unlikely_noCandidates": () => {
            let unlikelySessions = []
            Object.entries(sessions).forEach(([sessionId, session]) => {
                (!(session.gamemaster) && (session.gamemaster_candidates.length == 0) && (session.gamemaster_alternatives.length > 0)) ? unlikelySessions.push(sessionId) : {}
            })
            return unlikelySessions
        },
        "waitingForAssignment": () => {
            let waitingSessions = []
            Object.entries(sessions).forEach(([sessionId, session]) => {
                (!(session.gamemaster) && (session.gamemaster_candidates.length >0)) ? waitingSessions.push(sessionId) : {}
            })
            return waitingSessions
        },
        "filled": () => {
            let filledSessions = []
            Object.entries(sessions).forEach(([sessionId, session]) => {
                (session.gamemaster) ? filledSessions.push(sessionId) : {}
            })
            return filledSessions
        },
    }
    let sessionsStatus = () =>  {
            log(LOG_LEVEL.INFO,`>>>Sessions stats:`)
            let maxSessions = Object.keys(sessions).length
            let elts
            let res = {
                "impossible": sessionsStates.impossible(),
                "unlikely_noCandidates": sessionsStates.unlikely_noCandidates(),
                "waitingForAssignment": sessionsStates.waitingForAssignment(),
                "filled": sessionsStates.filled()
            }

            if (res["filled"].length == maxSessions){
                log(LOG_LEVEL.INFO,`All sessions are ensured.`)
            } else {
                log(LOG_LEVEL.INFO,`All the sessions aren't(/yet) ensured. Here's the detail:`)
            }
            log(LOG_LEVEL.INFO, `${res["impossible"].length}/${maxSessions} sessions have no trained candidate gamemaster available - These sessions cannot be ensured. Sessions: ${res["impossible"]}`)
            log(LOG_LEVEL.INFO, `${res["unlikely_noCandidates"].length}/${maxSessions} sessions could not find a gamemaster due to the current draw. Sessions: ${res["unlikely_noCandidates"]}`)
            log(LOG_LEVEL.INFO, `${res["waitingForAssignment"].length}/${maxSessions} sessions have multiple available game masters waiting for assignment...Sessions: ${res["waitingForAssignment"]}`)
            log(LOG_LEVEL.INFO, `${res["filled"].length}/${maxSessions} sessions have a gamemaster. Sessions: ${res["filled"]}`)
            console.log("\n\n")
            return res
        }
    
    let status = sessionsStatus()

    let gmAssignedSessions = () => {
        let res = {}
        Object.keys(sessions).forEach((key) => {
            let session = sessions[key]
            let gm = session.gamemaster
            gm ? res[gm] = key : {}
        })
        Object.keys(gamemasters).forEach((gmId) => {
            if (!(gmId in res)){
                res[gmId] = null
            }
        })
        return res
    }

    let gmAssignmentFinished = () => {
        Object.keys(sessions).forEach((key) => {
            delete sessions[key].gamemaster_alternatives
            delete sessions[key].gamemaster_candidates
            delete sessions[key].room.trained_gamemasters
        })
        log(LOG_LEVEL.INFO,`Gamemaster assignment finished`)
        log(LOG_LEVEL.INFO,`All possible sessions have been ensured (see details above), Sessions:`, sessions)
        log(LOG_LEVEL.INFO, "Gamemaster assignment finished, see above for the final result")
        
    }

    log(LOG_LEVEL.INFO,`Step0 - Assigning sessions with exactly 1 candidate - Start`)
    let loopCount = 0
    let loopLimit = Object.keys(rooms).length
    let candidatesAssigned
    do {
        loopCount++
        log(LOG_LEVEL.INFO,`S0I${loopCount} - Step0 - Iteration #${loopCount} - Start`)
        candidatesAssigned = false
        let sessionIds = Object.keys(sessions)
        for(let i=0; i<sessionIds.length; i++){
            log(LOG_LEVEL.INFO, `S0I${loopCount} - Session #${i+1}`)
            //console.log(`Session #${i}`)
            let session = sessions[sessionIds[i]]
            if(session.gamemaster){
                log(LOG_LEVEL.INFO,`   SKIPPED - Session has a gamemaster`)
                continue
            }

            //console.log(`Session:`, session)
            log(LOG_LEVEL.INFO,`   Remaining candidate Gamemasters:`, session.gamemaster_candidates)
            switch (session.gamemaster_candidates.length) {
                case 0:
                    if(loopCount == 1){
                        log(LOG_LEVEL.INFO, "   No trained candidate gamemaster available - This session cannot be ensured")
                        log(LOG_LEVEL.DEBUG,`   >>Session:`, session)
                    } else {
                        log(LOG_LEVEL.INFO, "   No candidate gamemaster left - This session cannot be ensured for now")
                    }
                    break
                case 1:
                    log(LOG_LEVEL.INFO, "   >Exactly 1 candidate gamemaster available for that room on this iteration, assigning gamemaster to the session...")
                    log(LOG_LEVEL.DEBUG,`   >>Session:`, session)
                    let candidate = session.gamemaster_candidates[0]
                    session.gamemaster = candidate
                    candidatesAssigned = true
                    log(LOG_LEVEL.INFO,`   Candidate (${candidate}) assigned to this session. Now removing from every other session...`)
                    Object.keys(sessions).forEach((sessionIdx) => {
                        let eltIdx = sessions[sessionIdx].gamemaster_candidates.indexOf(candidate)
                        if(eltIdx != -1){ // Candidate found in this session
                            let removedElts = sessions[sessionIdx].gamemaster_candidates.splice(eltIdx,1)
                            
                            sessionIdx != sessionIds[i] ? sessions[sessionIdx].gamemaster_alternatives.push(...removedElts) : {}
                        }
                    })
                    break
                default:
                    log(LOG_LEVEL.INFO, "   >Multiple gamemaster candidates for this room for this iteration. We ll deal will multiple candidates case later in the process")
                    log(LOG_LEVEL.DEBUG, `   >>Session:`, session)
            }
        }
        log(LOG_LEVEL.INFO,`S0I${loopCount} - Step0 - Iteration #${loopCount} - End\n`)
        
    } while (candidatesAssigned && loopCount <= loopLimit)
    log(LOG_LEVEL.INFO,"Sessions:", sessions)
    status = sessionsStatus() 
    log(LOG_LEVEL.INFO,`Step0 - Assigning sessions with exactly 1 candidate - End\n`)

    if ((status.filled.length + status.impossible.length) == Object.keys(sessions).length) {
        gmAssignmentFinished()
        return
    }

    log(LOG_LEVEL.INFO,`Step1 - Assigning sessions with multiple candidates - Start`)
    waitingSessions = () => {
        let sessionsIdx = sessionsStates.waitingForAssignment()
        let waitingSess = Object.keys(sessions)
            .filter(key => sessionsIdx.includes(key))
            .reduce((obj, key) => {
                return {
                    ...obj,
                    [key]: sessions[key]
                }
            },{})
        return waitingSess
    }

    loopCount = 0
    loopLimit = Object.keys(waitingSessions()).length
    do {
        //Assertion: waiting sessions objects have candidates (waitingSessions defined as sessions without gamemaster and with candidates, as sessions are assigned a gamemaster, candidates should be removed)
        loopCount++
        log(LOG_LEVEL.INFO,`S1I${loopCount} - Step1 - Iteration #${loopCount} - Start`)

        let sessionIds = Object.keys(waitingSessions())
        let session = sessions[sessionIds[0]]
        if(sessionIds.length == 1){
            log(LOG_LEVEL.INFO, "Assigning last waiting session one of its remaining candidates...")
            session.gamemaster = session.gamemaster_candidates[0]
        } else {
            if(session.gamemaster_candidates.length >1){
                // Check if the first candidate is also required in another waiting session, if not we're using it, if yes we use the second candidate
                let candidate = session.gamemaster_candidates[0]
                for(let i=1; i<sessionIds.length; i++){
                    let lookaheadSession = sessions[sessionIds[i]]
                    if(lookaheadSession.gamemaster_candidates.includes(candidate)){
                        candidate = session.gamemaster_candidates[1]
                        break
                    }
                }
                session.gamemaster = candidate
                log(LOG_LEVEL.INFO,`   Candidate (${candidate}) assigned to this session. Now removing from every other session...`)
                Object.keys(sessions).forEach((sessionIdx) => {
                    let eltIdx = sessions[sessionIdx].gamemaster_candidates.indexOf(candidate)
                    if(eltIdx != -1){ // Candidate found in this session
                        let removedElts = sessions[sessionIdx].gamemaster_candidates.splice(eltIdx,1)

                        sessionIdx != sessionIds[0] ? sessions[sessionIdx].gamemaster_alternatives.push(...removedElts) : {}
                    }
                })
            } else {
                // Assign only candidate to the session
                let candidate = session.gamemaster_candidates[0]
                session.gamemaster = candidate
                log(LOG_LEVEL.INFO,`   Only candidate (${candidate}) of the session assigned to it. Now removing from every other session...`)
                Object.keys(sessions).forEach((sessionIdx) => {
                    let eltIdx = sessions[sessionIdx].gamemaster_candidates.indexOf(candidate)
                    if(eltIdx != -1){ // Candidate found in the session
                        let removedElts = sessions[sessionIdx].gamemaster_candidates.splice(eltIdx,1)
                        sessionIdx != sessionIds[0] ? sessions[sessionIdx].gamemaster_alternatives.push(...removedElts) : {}
                    }
                })
            }
        }

    } while(Object.keys(waitingSessions()).length >0 && loopCount <= loopLimit)
    log(LOG_LEVEL.INFO,"Sessions (as map):", sessions)
    status = sessionsStatus()
    log(LOG_LEVEL.INFO,`Step1 - Assigning sessions with multiple candidates - End\n`)

    if ((status.filled.length + status.impossible.length) == Object.keys(sessions).length) {
        gmAssignmentFinished()
        return
    }
    
    
    log(LOG_LEVEL.INFO,`Step2 - Adjusting sessions gamemasters to fill the remaining sessions without a gamemaster - Start`)
    Object.keys(sessions).forEach((key) => {
        let session = sessions[key]
        let gm = session.gamemaster
        if (session.gamemaster_alternatives.includes(gm)){
            let idx = session.gamemaster_alternatives.indexOf(gm)
            sessions[key].gamemaster_alternatives.splice(idx,1)
        }
        if (session.gamemaster_candidates.includes(gm)){
            let idx = session.gamemaster_candidates.indexOf(gm)
            sessions[key].gamemaster_candidates.splice(idx,1)
        }
    })

    let gmSessions = gmAssignedSessions()
    log(LOG_LEVEL.INFO, "Here's the gamemasters' currently assigned sessions:", gmSessions)

    let gmNoSessionsIds = Object.keys(gmSessions)
        .filter( (key) => gmSessions[key] == null)
    log(LOG_LEVEL.INFO, "Here are the gamemasters without an assigned session:", gmNoSessionsIds)

    let noGmSessions = status.unlikely_noCandidates.reduce((obj, key) => {
        return {
            ...obj,
            [key]: sessions[key]
        }}, {})
    log(LOG_LEVEL.INFO, "Here are the sessions without an assigned gamemaster:", noGmSessions)

    log(LOG_LEVEL.INFO, "Now for all of them weŕe going to look at their game master alternatives and see if the sessions they are currently assigned to can accept one of the gamemasters without session")
    
    Object.keys(noGmSessions).forEach((noGmSessionId) => {
        let session = sessions[noGmSessionId]
        let res = session.gamemaster_alternatives.forEach((altGmId) => {
            let altGmSessionId = gmSessions[altGmId]
            let altGmSession = sessions[altGmSessionId]
            let res = gmNoSessionsIds.forEach((noSessionGmId) => {
                if(altGmSession.gamemaster_alternatives.includes(noSessionGmId)){
                    return {
                        altGmSessionId: noSessionGmId,
                        noGmSessionId: altGmId
                    }
                }
            })
            if (res) { 
                //Stop looking through noGmSession alternative gamemasters
                return res
            }
        })
        if (res) {
            log(LOG_LEVEL.INFO, "A solution has been found with the following session-gamemaster pairs. Assigning...", res)
            Object.keys(res).forEach((sessionId) => {
                let targetSession = sessionId
                let targetSessionGm = res[sessionId]
                // Put back in alternatives old gamemaster, if not null
                sessions[targetSession].gamemaster ? sessions[targetSession].gamemaster_alternatives.push( sessions[targetSession].gamemaster ) : {}
                // Remove from alternatives new gamemaster
                let idx = sessions[targetSession].gamemaster_alternatives.indexOf(targetSessionGm)
                sessions[targetSession].gamemaster_alternatives.splice(idx, 1)
                // Assign new gamemaster
                sessions[targetSession].gamemaster = targetSessionGm
            })
        } else {
            log(LOG_LEVEL.INFO, `Session #${ noGmSessionId } - No optimisation has been found with current substitution logic and gamemasters subset`)
        }
    })
    log(LOG_LEVEL.INFO,`Step2 - Adjusting sessions gamemasters to fill the remaining sessions without a gamemaster - End\n`)
    status = sessionsStatus()
    gmAssignmentFinished()

}


main()