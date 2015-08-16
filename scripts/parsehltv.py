#!/usr/bin/env python
# -*- coding: utf-8 -*-

import os
import calendar
from time import sleep
from lxml import html
import datetime
import time
from pymongo import MongoClient
import requests

if os.environ.get('MONGOLAB_URI'):
    server = str(os.environ['MONGOLAB_URI'])
    dbName = str(os.environ['REMOTE_HLTV_DB_NAME'])
    print 'connecting to ' + server
    conn = MongoClient(server)
    db = conn[dbName]
else:
    conn = MongoClient()
    db = conn['hltv']

collection = db.matches

def ParseHLTVPage(pageUrl):
    page_matches = [];
    page = requests.get(pageUrl) 
    tree = html.fromstring(page.text)

    curMatch = 0;
    evenMatches = tree.xpath('//div[@id="back"]/div[@class="mainAreaNoHeadline"]/div[@class="centerNoHeadline"]/div[@class="centerFade"]/div[@class="covMainBoxContent"]/div[@style=""]/div[@style="width:606px;height:22px;background-color:white"]/div')
    oddMatches = tree.xpath('//div[@id="back"]/div[@class="mainAreaNoHeadline"]/div[@class="centerNoHeadline"]/div[@class="centerFade"]/div[@class="covMainBoxContent"]/div[@style=""]/div[@style="width:606px;height:22px;background-color:#E6E5E5"]/div')

    os.environ['TZ'] = 'Europe/London'
    time.tzset()

    for matchCount in range(0, 25):
        match = {}
        score = {}
        event = {}
        team1 = {}
        team2 = {}

        # get the date
        date_string = str(evenMatches[matchCount].xpath('a[1]/div[1]/text()')[0])
        dateM = date_string[0:date_string.find("/")]
        month = date_string[date_string.find("/") + 1:date_string.find(" ")]
        year = date_string[date_string.find(" ") + 1:]
        date = time.strptime(dateM + '/' + month + '/' + year, "%d/%m/%y")
        date = time.mktime(date)

        # get a link to the match -- may use this later for deeper information, like player scores
        ids = str(evenMatches[matchCount].xpath('a[1]/@href')[0])
        pageid = ids[9:ids.find('&')]
        matchid = ids[ids.find('match') + 8:]
        match['url'] = 'http://www.hltv.org/?pageid=' + pageid + '&matchid=' + matchid

        # get the map the game was played on
        match['map'] = str(evenMatches[matchCount].xpath('div/text()')[0])

        # get the event the map was played in
        event['url'] = 'http://www.hltv.org' + str(evenMatches[matchCount].xpath('a[4]/@href')[0])
        event['name'] = str(evenMatches[matchCount].xpath('a[4]/div/span/@title')[0].encode('utf-8'))
        team1['url'] = 'http://www.hltv.org' + str(evenMatches[matchCount].xpath('a[2]/@href')[0])
        
        # separate team 1's name and score
        team1name_score = evenMatches[matchCount].xpath('a[2]/div/text()')[0]
        score['team_1'] = team1name_score[team1name_score.rfind("(") + 1 : team1name_score.rfind(")")]
        team1['name'] = team1name_score[1 : team1name_score.rfind("(") - 1].encode('utf-8')

        # separate team 2's name and score
        team2['url'] = 'http://www.hltv.org' + str(evenMatches[matchCount].xpath('a[3]/@href')[0])       
        team2name_score = evenMatches[matchCount].xpath('a[3]/div/text()')[0]
        score['team_2'] = team2name_score[team2name_score.rfind("(") + 1 : team2name_score.rfind(")")]
        team2['name'] = team2name_score[1 : team2name_score.rfind("(") - 1].encode('utf-8')
        
        # set the match stuff
        match['date'] = int(date)
        match['team1'] = team1
        match['team2'] = team2
        match['score'] = score
        match['event'] = event
        match['_id'] = str(pageid) + str(matchid) 

        if collection.find({'_id':match['_id']}).limit(1).count() > 0:
            return False
        else:
            collection.insert(match)
            print 'Added new HLTV match: ' + str(match['_id'])

        match = {}
        score = {}
        event = {}
        team1 = {}
        team2 = {}

        # get the date
        date_string = str(oddMatches[matchCount].xpath('a[1]/div[1]/text()')[0])
        dateM = date_string[0:date_string.find("/")]
        month = date_string[date_string.find("/") + 1:date_string.find(" ")]
        year = date_string[date_string.find(" ") + 1:]
        date = time.strptime(dateM + '/' + month + '/' + year, "%d/%m/%y")
        date = time.mktime(date)

        # get a link to the match -- may use this later for deeper information, like player scores
        ids = str(oddMatches[matchCount].xpath('a[1]/@href')[0])
        pageid = ids[9:ids.find('&')]
        matchid = ids[ids.find('match') + 8:]
        match['url'] = 'http://www.hltv.org/?pageid=' + pageid + '&matchid=' + matchid

        # get the map the game was played on
        match['map'] = str(oddMatches[matchCount].xpath('div/text()')[0])

        # get the event the map was played in
        event['url'] = 'http://www.hltv.org' + str(oddMatches[matchCount].xpath('a[4]/@href')[0])
        event['name'] = str(oddMatches[matchCount].xpath('a[4]/div/span/@title')[0].encode('utf-8'))
        team1['url'] = 'http://www.hltv.org' + str(oddMatches[matchCount].xpath('a[2]/@href')[0])
        
        # separate team 1's name and score
        team1name_score = oddMatches[matchCount].xpath('a[2]/div/text()')[0]
        score['team_1'] = team1name_score[team1name_score.rfind("(") + 1 : team1name_score.rfind(")")]
        team1['name'] = team1name_score[1 : team1name_score.rfind("(") - 1].encode('utf-8')

        # separate team 2's name and score
        team2['url'] = 'http://www.hltv.org' + str(oddMatches[matchCount].xpath('a[3]/@href')[0])       
        team2name_score = oddMatches[matchCount].xpath('a[3]/div/text()')[0]
        score['team_2'] = team2name_score[team2name_score.rfind("(") + 1 : team2name_score.rfind(")")]
        team2['name'] = team2name_score[1 : team2name_score.rfind("(") - 1].encode('utf-8')
        
        # set the match stuff
        match['date'] = int(date)
        match['team1'] = team1
        match['team2'] = team2
        match['score'] = score
        match['event'] = event
        match['_id'] = str(pageid) + str(matchid) 

        if collection.find({'_id':match['_id']}).limit(1).count() > 0:
            return False
        else:
            collection.insert(match)
            print 'Added new HLTV match: ' + str(match['_id'])

    return True

x = 0;
while(True):
    if not ParseHLTVPage('http://www.hltv.org/?pageid=188&offset=' + str(x * 50)):
        break
    #print 'Parsed page ' + str(x + 1) + '...'
    x = x + 1
    sleep(1)
#print 'Done parsing HLTV.'