#!/bin/python3
# -*- coding: UTF-8 -*-
import os, re, sys, json, requests, time, datetime
from multiprocessing.dummy import Pool as ThreadPool

def findstr(rule, string):
	find_str = re.compile(rule)
	return find_str.findall(string)

def getTime():
	return datetime.datetime.now().strftime('%m/%d-%H:%M:%S')

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
		except WindowsError:
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
	def get(self, url, name=''):
		try:
			req = requests.get(url, headers = self.headers, cookies = self.jar, timeout=90)
			return req.text
		except:
			print("%s|Bot: %s|NetworkError|Request: %s" % (getTime(), name, url))
			return False
	def post(self, url, postdata, name=''):
		try:
			req = requests.post(url, headers = self.headers, data = postdata, timeout=90)
			return req.text
		except:
			print("%s|Bot: %s|NetworkError|Request: %s" % (getTime(), name, url))
			return False
	def npost(self, url, postdata, name=''):
		try:
			req = requests.post(url, headers = self.headers, data = postdata, timeout=90)
			return [req.text, req.headers]
		except:
			print("%s|Bot: %s|NetworkError|Request: %s" % (getTime(), name, url))
			return False

class saliens:
	def __init__(self):
		self.apiStart = 'https://community.steam-api.com/ITerritoryControlMinigameService'
		self.token = ''
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
	def myprint(self, string):
		try:
			print(string)
		except:
			self.language = 'english'
			print('%s|Bot: %s|PrintError|Switch to English')
	def loadcfg(self, data):
		self.name, path = data
		conf = filelib().opencfg(path)
		self.token = conf["token"]
	def getPlayerInfo(self):
		self.playerInfo = json.loads(weblib().post(self.apiStart+'/GetPlayerInfo/v0001/',
			{
				"access_token": self.token
			},
		self.name))["response"]
		if "active_planet" in self.playerInfo:
			self.myprint("%s|Bot: %s|PlanetId: %s|Level: %s|Exp: %s/%s" % (getTime(), self.name, self.playerInfo["active_planet"], self.playerInfo["level"], self.playerInfo["score"], self.playerInfo["next_level_score"]))
		else:
			self.myprint("%s|Bot: %s|Level: %s|Exp: %s/%s" % (getTime(), self.name, self.playerInfo["level"], self.playerInfo["score"], self.playerInfo["next_level_score"]))
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
				self.myprint("%s|Bot: %s|LeaveGame|Failed|Retrying after 10s..." % (getTime(), self.name))
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
			self.myprint("%s|Bot: %s|JoinZone: %s|Difficulty: %s" % (getTime(), self.name, self.zone_position, self.difficulty))
			return True
		else:
			try:
				gameid = int(findstr('\d*$', req[1]["X-error_message"])[0])
				self.myprint("%s|Bot: %s|AlreadyInGame|LeaveGame" % (getTime(), self.name))
				self.leaveGame(gameid)
				return False
			except:
				self.myprint("%s|Bot: %s|Error: %s|Retry after 30s..." % (getTime(), self.name, req[1]["X-error_message"]))
				time.sleep(30)
				return False
	def getScoreInfo(self, errorTime=0):
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
		else:
			if errorTime > 1:
				self.myprint("%s|Bot: %s|UploadScore|Failed" % (getTime(), self.name))
			else:
				self.myprint("%s|Bot: %s|UploadScore|Failed|Retrying..." % (getTime(), self.name))
				time.sleep((errorTime+1)*5)
				self.getScoreInfo(errorTime+1)
	def getBestPlanet(self):
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
			if zone["difficulty"] == 1 and zone["captured"] == False:
				difficulty = 1
				break
		for zone in zones:
			if zone["difficulty"] == 2 and zone["captured"] == False:
				difficulty = 2
				break
		for zone in zones:
			if zone["difficulty"] == 3 and zone["captured"] == False:
				difficulty = 3
				break
		return difficulty
	def getHardZone(self):
		if not self.difficulty:
			self.difficulty = 3
		zones = self.planetInfo["zones"]
		for zone in zones:
			if zone["difficulty"] == self.difficulty and zone["captured"] == False:
				if (self.difficulty == 3 and zone["capture_progress"] < 0.99) or (self.difficulty < 3 and zone["capture_progress"] < 0.95):
					self.zone_position = zone["zone_position"]
					self.myprint("%s|Bot: %s|SelectZone: %s|Progress: %s" % (getTime(), self.name, self.zone_position, zone["capture_progress"]))
					break
		if self.zone_position == -1:
			self.myprint("%s|Bot: %s|SwitchPlanet|Getting info..." % (getTime(), self.name))
			self.getBestPlanet()
			if "active_planet" in bot.playerInfo:
				if bot.bestPlanet != bot.playerInfo["active_planet"]:
					bot.leavePlanet()
					bot.joinPlanet(bot.bestPlanet)
					bot.getPlayerInfo()
			else:
				bot.joinPlanet(bot.bestPlanet)
				bot.getPlayerInfo()
			self.getPlanetInfo()
			self.getHardZone()

def handler(data):
	bot = saliens()
	bot.loadcfg(data)
	while True:
		try:
			bot.getPlayerInfo()
			bot.getBestPlanet()
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
			joined = bot.getJoinInfo()
			if joined:
				time.sleep(110)
				bot.getScoreInfo()
			else:
				pass
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