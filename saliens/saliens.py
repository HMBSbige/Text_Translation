#!/bin/python3
# -*- coding: UTF-8 -*-
import os, re, sys, json, requests, time, datetime, random
from multiprocessing.dummy import Pool as ThreadPool

def findstr(rule, string):
	find_str = re.compile(rule)
	return find_str.findall(string)

def getTime():
	return datetime.datetime.now().strftime('%m/%d-%H:%M:%S')

def getTimestamp():
	return int(time.time())

class filelib:
	def open(self, path, mode='r', encoding="gbk"):
		try:
			file = open(path, mode, encoding=encoding)
			content = file.read()
			file.close()
			return content
		except:
			return False
	def write(self, path, content, mode='w', encoding="gbk"):
		file = open(path, mode, encoding=encoding)
		file.write(content)
		file.close()
		return True
	def mkdir(self, dirname):
		try:
			os.mkdir(dirname)
		except:
			pass
		return True
	def opencfg(self, path):
		cont = self.open(path, encoding="utf-8")
		if cont:
			cont = re.sub('(?<!:)\\/\\/.*|\\/\\*(\\s|.)*?\\*\\/', '', cont)
			cont = cont.replace('\\', '\\\\').replace('\\\\"', '\\"')
			return json.loads(cont)
		else:
			return False


class weblib:
	headers = {
		'Accept': '*/*',
		'DNT': '1',
		'Origin': 'https://steamcommunity.com',
		'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36',
		'Referer': 'https://steamcommunity.com/saliengame/play/'
	}
	jar = requests.cookies.RequestsCookieJar()
	def myprint(self, string):
		try:
			print(string)
		except:
			print("Network Error!")
	def get(self, url, name=''):
		try:
			req = requests.get(url, headers = self.headers, cookies = self.jar, timeout=90)
			return req.text
		except:
			self.myprint("%s|Bot: %s|NetworkError|Request: %s" % (getTime(), name, url))
			return False
	def post(self, url, postdata, name=''):
		try:
			req = requests.post(url, headers = self.headers, data = postdata, timeout=90)
			return req.text
		except:
			self.myprint("%s|Bot: %s|NetworkError|Request: %s" % (getTime(), name, url))
			return False
	def npost(self, url, postdata, name=''):
		try:
			req = requests.post(url, headers = self.headers, data = postdata, timeout=90)
			return [req.text, req.headers]
		except:
			self.myprint("%s|Bot: %s|NetworkError|Request: %s" % (getTime(), name, url))
			return False

class saliens:
	def __init__(self):
		self.apiStart = 'https://community.steam-api.com/ITerritoryControlMinigameService'
		self.token = ''
		self.accountid = ''
		self.playerInfo = {}
		self.planetInfo = {}
		self.joinInfo = {}
		self.scoreInfo = {}
		self.bestPlanet = ''
		self.zone_position = -1
		self.name = ''
		self.availPlanets = []
		self.difficulty = 0
		self.language = 'schinese'
		self.time = 0
		self.bossScore = 0
		self.tmpScore = 0
		self.help = 0
	def myprint(self, string):
		try:
			print(string)
		except:
			if self.language != 'english':
				self.language = 'english'
			else:
				pass
	def loadcfg(self, data):
		self.name, path = data
		conf = filelib().opencfg(path)
		self.token = conf["token"]
		self.accountid = int(conf["steamid"]) - 76561197960265728
	def getPlayerInfo(self):
		self.playerInfo = json.loads(weblib().post(self.apiStart+'/GetPlayerInfo/v0001/',
			{
				"access_token": self.token
			},
		self.name))["response"]
		team = ""
		if "clan_info" in self.playerInfo:
			team = "|Team: " + self.playerInfo["clan_info"]["name"]
		if "active_planet" in self.playerInfo:
			self.myprint("%s|Bot: %s|PlanetId: %s|Level: %s|Exp: %s/%s%s" % (getTime(), self.name, self.playerInfo["active_planet"], self.playerInfo["level"], self.playerInfo["score"], self.playerInfo["next_level_score"], team))
		else:
			self.myprint("%s|Bot: %s|Level: %s|Exp: %s/%s%s" % (getTime(), self.name, self.playerInfo["level"], self.playerInfo["score"], self.playerInfo["next_level_score"], team))
	def getPlanetInfo(self, planetId=None):
		if planetId==None:
			planetId = self.playerInfo["active_planet"]
		self.planetInfo = json.loads(weblib().get(self.apiStart+'/GetPlanet/v0001/?id='+planetId+'&language='+self.language, self.name))["response"]["planets"][0]
		self.myprint("%s|Bot: %s|Planet: %s|Progress: %s" % (getTime(), self.name, self.planetInfo["state"]["name"], self.planetInfo["state"]["capture_progress"]))
	def joinPlanet(self, planetId):
		self.myprint("%s|Bot: %s|JoinPlanet: %s" % (getTime(), self.name, planetId))
		weblib().post(self.apiStart+'/JoinPlanet/v0001/',
			{
				"id": int(planetId),
				"access_token": self.token
			},
		self.name)
	def leavePlanet(self):
		self.leaveGame(self.playerInfo["active_planet"])
		errorTime = 0
		while errorTime < 3:
			self.getPlayerInfo()
			if "active_planet" in self.playerInfo:
				errorTime += 1
				self.myprint("%s|Bot: %s|LeaveGame|Failed|Retry after 10s..." % (getTime(), self.name))
				time.sleep(10)
				self.leaveGame()
			else:
				break
		self.getPlayerInfo()
		if "active_planet" in self.playerInfo:
			self.myprint("%s|Bot: %s|LeavePlanet|Failed|RestartInstance" % (getTime(), self.name))
			return False
	def leaveGame(self, gameid=-1):
		if gameid==-1:
			gameid=self.playerInfo["active_planet"]
		self.myprint("%s|Bot: %s|LeaveGame: %s" % (getTime(), self.name, gameid))
		result = weblib().post('https://community.steam-api.com/IMiniGameService/LeaveGame/v0001/',
			{
				"access_token": self.token,
				"gameid": gameid
			},
		self.name)
	def joinBossZone(self):
		req = weblib().npost(self.apiStart+'/JoinBossZone/v0001/',
			{
				"zone_position": self.zone_position,
				"access_token": self.token
			},
		self.name)
		eresult = int(findstr('\d+', req[1]["X-eresult"])[0])
		if eresult != 1:
			self.myprint("%s|Bot: %s|JoinBossZone: %s|Failed|RestartInstance" % (getTime(), self.name, self.zone_position))
			return False
		else:
			time.sleep(4)
			return True
	def fightBoss(self):
		bossFailsAllowed = 10
		nextHeal = getTimestamp() + random.randint(120, 180)
		self.bossScore += self.tmpScore
		while True:
			useHeal = 0
			damageToBoss = 1
			damageTaken = 0
			if getTimestamp() >= nextHeal:
				useHeal = 1
				nextHeal = getTimestamp() + 120
				self.myprint("%s|Bot: %s|BossFight|UsingHealAbility" % (getTime(), self.name))
			req = weblib().npost(self.apiStart+'/ReportBossDamage/v0001/',
				{
					"access_token": self.token,
					"use_heal_ability": useHeal,
					"damage_to_boss": damageToBoss,
					"damage_taken": damageTaken
				},
			self.name)
			eresult = int(findstr('\d+', req[1]["X-eresult"])[0])
			res = json.loads(req[0])["response"]
			if eresult == 11:
				self.myprint("%s|Bot: %s|BossFight|InvalidState|RestartInstance" % (getTime(), self.name))
				break
			if eresult != 1:
				bossFailsAllowed -= 1
				if bossFailsAllowed < 1:
					self.myprint("%s|Bot: %s|BossFight|ErrorTooMuch|RestartInstance" % (getTime(), self.name))
					break
			if "boss_status" in res:
				if "boss_players" not in res["boss_status"]:
					self.myprint("%s|Bot: %s|BossFight|Waiting..." % (getTime(), self.name))
					continue
			bossStatus = res["boss_status"]
			bossPlayers = bossStatus["boss_players"]
			myPlayer = None
			for player in bossPlayers:
				if player["accountid"] == self.accountid:
					myPlayer = player
					self.tmpScore = int(player["xp_earned"])
					self.myprint("%s|Bot: %s|BossFight|HP: %s/%s|Score: %s" % (getTime(), self.name, player["hp"], player["max_hp"], player["xp_earned"]))
					break
			if "game_over" in res:
				if res["game_over"] == True:
					self.myprint("%s|Bot: %s|BossFight|GameOver|TotalScore: %s" % (getTime(), self.name, str(self.bossScore)))
					break
			if "waiting_for_players" in res:
				if res["waiting_for_players"] == True:
					self.myprint("%s|Bot: %s|BossFight|WaitingForPlayers" % (getTime(), self.name))
					continue
			if myPlayer != None:
				self.myprint("%s|Bot: %s|BossFight|Lv: %s => %s|Exp Earned: %s" % (getTime(), self.name, myPlayer["level_on_join"], myPlayer["new_level"], myPlayer["xp_earned"]))
			self.myprint("%s|Bot: %s|BossFight|Boss HP: %s/%s|Lasers: %s|Team Heals: %s" % (getTime(), self.name, bossStatus["boss_hp"], bossStatus["boss_max_hp"], res["num_laser_uses"], res["num_team_heals"]))
			time.sleep(5)
	def getJoinInfo(self):
		req = weblib().npost(self.apiStart+'/JoinZone/v0001/', 
			{
				"zone_position": self.zone_position,
				"access_token": self.token
			},
		self.name)
		self.joinInfo = json.loads(req[0])["response"]
		if "zone_info" in self.joinInfo:
			self.joinInfo = self.joinInfo["zone_info"]
			self.time = int(getTimestamp() + 110)
			self.myprint("%s|Bot: %s|JoinZone: %s|Difficulty: %s" % (getTime(), self.name, self.zone_position, self.difficulty))
			return True
		else:
			try:
				gameid = int(findstr('\d+', req[1]["X-error_message"])[0])
				self.bug(gameid)
				return False
			except:
				if "boss zone" in req[1]["X-error_message"]:
					self.skip.append(self.zone_position)
					skipped = "|ZoneSkipped"
				else:
					skipped = ""
				self.myprint("%s|Bot: %s%s|Msg: %s|Retry after 10s..." % (getTime(), self.name, skipped, req[1]["X-error_message"]))
				time.sleep(10)
				return False
	def bug(self, gameid):
		self.myprint("%s|Bot: %s|AlreadyInGame|GameId: %s|BUG???" % (getTime(), self.name, str(gameid)))
		stillBug = True
		while stillBug == True:
			stillBug = self.getScoreInfo(1)
		self.myprint("%s|Bot: %s|AlreadyInGame|GameId: %s|LeaveGame" % (getTime(), self.name, str(gameid)))
		self.leaveGame(gameid)
	def getScoreInfo(self, errorTime=0):
		if errorTime == 0:
			self.getBestPlanet()
		if self.time != 0:
			time.sleep(self.time - getTimestamp())
			self.time = 0
		if self.difficulty == 1:
			score = 600
		elif self.difficulty == 2:
			score = 1200
		elif self.difficulty == 3:
			score = 2400
		self.scoreInfo = json.loads(weblib().post(self.apiStart+'/ReportScore/v0001/', 
			{
				"access_token": self.token,
				"score": score,
				"language": self.language
			},
		self.name))["response"]
		if "new_score" in self.scoreInfo:
			self.myprint("%s|Bot: %s|UploadScore|Exp: %s/%s" % (getTime(), self.name, self.scoreInfo["new_score"], self.scoreInfo["next_level_score"]))
			return True
		else:
			if errorTime > 1:
				self.myprint("%s|Bot: %s|UploadScore|Failed" % (getTime(), self.name))
				return False
			else:
				time.sleep(1)
				self.getScoreInfo(errorTime+1)
	def getBestPlanet(self):
		if self.help == 1:
			availPlanets = json.loads(weblib().get(self.apiStart+'/GetPlanets/v0001/?active_only=1&language='+self.language, self.name))["response"]["planets"]
			bestProgress = 0
			for planet in availPlanets:
				if planet["state"]["capture_progress"] > bestProgress:
					bestProgress = planet["state"]["capture_progress"]
					self.difficulty = 1
					self.bestPlanet = planet["id"]
		else:
			availPlanets = json.loads(weblib().get(self.apiStart+'/GetPlanets/v0001/?active_only=1&language='+self.language, self.name))["response"]["planets"]
			self.availPlanets = []
			for planet in availPlanets:
				self.availPlanets.append([planet["id"], self.getZoneInfo(planet["id"])]);
			self.difficulty = 0
			for planet in self.availPlanets:
				if planet[1]>self.difficulty:
					self.difficulty = planet[1]
					self.bestPlanet = planet[0]
	def getZoneInfo(self, planetId):
		planetInfo = json.loads(weblib().get(self.apiStart+'/GetPlanet/v0001/?id='+planetId+'&language='+self.language, self.name))["response"]["planets"][0]
		zones = planetInfo["zones"]
		for zone in zones:
			if zone["difficulty"] == 1 and zone["captured"] == False and "top_clans" in zone:
				difficulty = 1
				break
		for zone in zones:
			if zone["difficulty"] == 2 and zone["captured"] == False and "top_clans" in zone:
				difficulty = 2
				break
		for zone in zones:
			if zone["difficulty"] == 3 and zone["captured"] == False and "top_clans" in zone:
				difficulty = 3
				break
		for zone in zones:
			if (zone["type"] == 4) and ("boss_active" in zone):
				if zone["boss_active"] == True:
					difficulty = 4
					break
		return difficulty
	def getHardZone(self):
		if not self.difficulty:
			self.difficulty = 3
		self.zone_position = -1
		zones = self.planetInfo["zones"]
		for zone in zones:
			if zone["zone_position"] == 0 and "capture_progress" in zone and zone["capture_progress"] == 0:
				continue
			if "boss_active" in zone and zone["boss_active"] == True:
				self.zone_position = zone["zone_position"]
				self.myprint("%s|Bot: %s|SelectBossZone: %s" % (getTime(), self.name, self.zone_position))
				break
			if zone["difficulty"] == self.difficulty and zone["captured"] == False:
				if (self.difficulty == 3 and zone["capture_progress"] < 0.99) or (self.difficulty < 3 and zone["capture_progress"] < 0.95):
					self.zone_position = zone["zone_position"]
					self.myprint("%s|Bot: %s|SelectZone: %s|Progress: %s" % (getTime(), self.name, self.zone_position, zone["capture_progress"]))
					break
		if self.zone_position == -1:
			self.myprint("%s|Bot: %s|SwitchPlanet|Getting info..." % (getTime(), self.name))
			self.getBestPlanet()
			if "active_planet" in self.playerInfo:
				if self.bestPlanet != self.playerInfo["active_planet"]:
					self.leavePlanet()
					self.joinPlanet(self.bestPlanet)
					self.getPlayerInfo()
			else:
				self.joinPlanet(self.bestPlanet)
				self.getPlayerInfo()
			self.getPlanetInfo()
			self.getHardZone()
	def helpOthers(self):
		self.myprint("%s|Bot: %s|HelpOthers" % (getTime(), self.name))
		self.difficulty = 1
		self.help = 1
		self.getBestPlanet()

def handler(data):
	bot = saliens()
	try:
		bot.loadcfg(data)
	except:
		print("%s|Bot: %s|LoadConfig|Error!" % (getTime(), data[0]))
	bot.getPlayerInfo()
	bot.getBestPlanet()
	while True:
		if int(bot.playerInfo["level"]) >= 21:
			bot.helpOthers()
		try:
			if "active_planet" in bot.playerInfo:
				if bot.bestPlanet != bot.playerInfo["active_planet"]:
					bot.leavePlanet()
					bot.joinPlanet(bot.bestPlanet)
					bot.getPlayerInfo()
			else:
				bot.joinPlanet(bot.bestPlanet)
				bot.getPlayerInfo()
			bot.getPlanetInfo()
			bot.getHardZone()
			if bot.difficulty == 4:
				if bot.joinBossZone():
					bot.fightBoss()
				continue
			if bot.getJoinInfo():
				time.sleep(85)
				bot.getScoreInfo()
				bot.getPlayerInfo()
				if "active_zone_game" in bot.playerInfo:
					bot.bug(bot.playerInfo["active_zone_game"])
			else:
				bot.getPlayerInfo()
				bot.getBestPlanet()
		except:
			pass

def main():
	try:
		filelib().mkdir('configs')
	except:
		pass
	sys.path.append('configs')
	list_dirs = os.walk('configs')
	filelists = []
	for root, dirs, files in list_dirs:
		for f in files:
			path = os.path.join(root, f)
			filelists.append([f.split('.')[0], path])
	pool = ThreadPool(len(filelists)+1)
	for i in range(0, len(filelists)):
		pool.apply_async(handler, args=(filelists[i], ))
	pool.close()
	pool.join()

if __name__ == '__main__':
	main()