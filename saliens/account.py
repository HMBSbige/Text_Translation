#!/bin/python3
# -*- coding: UTF-8 -*-
import os, re, sys, json

class filelib:
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

def main():
	name = ''
	token = ''
	filelib().mkdir('configs')
	while name == "":
		name = input('请输入Bot名：')
	while token == "":
		token = input('请输入token：')
	filelib().write('configs/'+name+'.json', json.dumps({"token": token}))

if __name__ == '__main__':
	main()