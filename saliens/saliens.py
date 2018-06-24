# -*- coding: UTF-8 -*-
import os, re, sys, json, requests, time
from multiprocessing.dummy import Pool as ThreadPool

def findstr(rule, string):
	find_str = re.compile(rule)
	return find_str.findall(string)

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
	def get(self, url):
		try:
			req = requests.get(url, headers = self.headers, cookies = self.jar)
			return req.text
		except:
			print("Network Error!")
			return False
	def post(self, url, postdata):
		try:
			req = requests.post(url, headers = self.headers, data = postdata)
			return req.text
		except:
			print("Network Error!")
			return False
	def npost(self, url, postdata):
		try:
			req = requests.post(url, headers = self.headers, data = postdata)
			return [req.text, req.headers]
		except:
			print("Network Error!")
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
		self.zone_position = 0
		self.name = ''
		self.availPlanets = []
		self.difficulty = 0
	def loadcfg(self, data):
		self.name, path = data
		conf = filelib().opencfg(path)
		self.token = conf["token"]
	def getPlayerInfo(self):
		self.playerInfo = json.loads(weblib().post(self.apiStart+'/GetPlayerInfo/v0001/',
			{
				"access_token": self.token
			}
		))["response"]
		if "active_planet" in self.playerInfo:
			print("Bot: %s Current PlanetId: %s Current Level: %s Exp: %s/%s" % (self.name, self.playerInfo["active_planet"], self.playerInfo["level"], self.playerInfo["score"], self.playerInfo["next_level_score"]))
		else:
			print("Bot: %s Current Level: %s Exp: %s/%s" % (self.name, self.playerInfo["level"], self.playerInfo["score"], self.playerInfo["next_level_score"]))
	def getPlanetInfo(self, planetId=None):
		if planetId==None:
			planetId = self.playerInfo["active_planet"]
		self.planetInfo = json.loads(weblib().get(self.apiStart+'/GetPlanet/v0001/?id='+planetId+'&language=schinese'))["response"]["planets"][0]
		print("Bot: %s Current Planet: %s Planet Progress: %s" % (self.name, self.planetInfo["state"]["name"], self.planetInfo["state"]["capture_progress"]))
	def joinPlanet(self, planetId):
		print("Bot: %s joining planet %s" % (self.name, planetId))
		weblib().post(self.apiStart+'/JoinPlanet/v0001/',
			{
				"id": int(planetId),
				"access_token": self.token
			}
		)
	def leavePlanet(self, gameid=None):
		if gameid==None:
			gameid=self.playerInfo["active_planet"]
			print("Bot: %s leaving planet %s" % (self.name, self.playerInfo["active_planet"]))
		else:
			print("Bot: %s resetting status" % self.name)
		result = weblib().post('https://community.steam-api.com/IMiniGameService/LeaveGame/v0001/',
			{
				"access_token": self.token,
				"gameid": gameid
			}
		)
	def getJoinInfo(self):
		req = weblib().npost(self.apiStart+'/JoinZone/v0001/', 
			{
				"zone_position": self.zone_position,
				"access_token": self.token
			}
		)
		self.joinInfo = json.loads(req[0])["response"]
		if "zone_info" in self.joinInfo:
			self.joinInfo = self.joinInfo["zone_info"]
			print("Bot: %s joined zone %s" % (self.name, self.zone_position))
			return True
		else:
			try:
				gameid = findstr('\d*', req[1]["X-error_message"])[0]
				print("Bot: %s Error: %s Will reset after 60s..." % (self.name, req[1]["X-error_message"]))
				time.sleep(60)
				self.leavePlanet(gameid)
				return False
			except:
				print("Bot: %s Error: %s Wait 60s to retry..." % (self.name, req[1]["X-error_message"]))
				time.sleep(60)
				return False
	def getScoreInfo(self, errorTime=0, difficulty=None):
		if self.difficulty == 1:
			score = 600
		elif self.difficulty == 2:
			score = 1200
		elif self.difficulty == 3:
			score = 2400
		if not difficulty == None:
			score = 0
		self.scoreInfo = json.loads(weblib().post(self.apiStart+'/ReportScore/v0001/', 
			{
				"access_token": self.token,
				"score": score,
				"language": "schinese"
			}
		))["response"]
		if "new_score" in self.scoreInfo:
			print("Bot: %s upload score success! Exp: %s/%s" % (self.name, self.scoreInfo["new_score"], self.scoreInfo["next_level_score"]))
		else:
			if not difficulty == None:
				print("Bot: %s needs to ")
			if errorTime > 3:
				print("Bot: %s upload score failed!" % self.name)
			else:
				print("Bot: %s upload score failed! retrying..." % self.name)
				time.sleep((errorTime+1) * 5)
				self.getScoreInfo(errorTime+1)
	def getBestPlanet(self):
		availPlanets = json.loads(weblib().get(self.apiStart+'/GetPlanets/v0001/?active_only=1&language=schinese'))["response"]["planets"]
		self.availPlanets = []
		for planet in availPlanets:
			self.availPlanets.append([planet["id"], self.getZoneInfo(planet["id"])]);
		self.difficulty = 0
		for planet in self.availPlanets:
			if planet[1]>self.difficulty:
				self.difficulty = planet[1]
				self.bestPlanet = planet[0]
	def getZoneInfo(self, planetId):
		planetInfo = json.loads(weblib().get(self.apiStart+'/GetPlanet/v0001/?id='+planetId+'&language=schinese'))["response"]["planets"][0]
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
				self.zone_position = zone["zone_position"]
				break
		if self.zone_position == 0:
			print("Bot: %s can't find zones! Getting all planets info." % self.name)
			self.difficulty = 0
			self.leavePlanet()
			self.getBestPlanet()
			self.joinPlanet(self.bestPlanet)
			self.getPlayerInfo()
			if self.playerInfo["active_planet"] != self.bestPlanet:
				print("Bot: %s switching planet failed!" % self.name)
				sys.exit()
			else:
				self.getPlanetInfo()
			self.getHardZone()

def handler(data):
	bot = saliens()
	bot.loadcfg(data)
	while True:
		try:
			bot.getPlayerInfo()
			if "active_planet" in bot.playerInfo:
				bot.leavePlanet()
			bot.getBestPlanet()
			bot.joinPlanet(bot.bestPlanet)
			bot.getPlayerInfo()
			bot.getPlanetInfo()
			bot.getHardZone()
			joined = bot.getJoinInfo()
			if joined:
				time.sleep(120)
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
			filelists.append([f, path])
	pool = ThreadPool(len(filelists)+1)
	for i in range(0, len(filelists)):
		pool.apply_async(handler, args=(filelists[i], ))
	pool.close()
	pool.join()

if __name__ == '__main__':
	main()