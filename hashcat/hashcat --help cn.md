# hashcat - 高级密码恢复

**用法: hashcat [选项]... hash|hash文件|hccapx文件 [字典|掩码|目录]...**

## 选项

选项 缩写 / 原文|参数类型|描述|用例
--------------------| ---- |-----------|--------
-m,--hash-type|数字|Hash种类，参见下面的参考|-m 1000
-a,--attack-mode|数字|攻击模式，参见下面的参考|-a 3
-V,--version||输出版本信息|
-h,--help||输出帮助信息|
--quiet||禁用输出|
--hex-charset||字符集以十六进制形式给出|
--hex-salt||盐以十六进制形式给出|
--hex-wordlist||字典中的单词是以十六进制形式给出的|
--force||忽略警告|
--status||自动更新屏幕|
--status-timer|数字|设置自动更新屏幕间隔为X秒|--status-timer=1
--machine-readable||以机器可读格式显示状态视图|
--keep-guessing||被破解之后继续猜测Hash|
--loopback||在induction目录中加入新的纯文本文件|
--weak-hash-threshold|数字|当阈值为X时停止检查弱Hash|--weak=0
--markov-hcstat|文件|指定要使用的hcstat文件|--markov-hc=my.hcstat
--markov-disable||禁用马尔可夫链，模仿经典暴力破解|
--markov-classic||启用经典马尔可夫链，无任何位置|
-t,--markov-threshold|数字|当阈值X时停止接收新的马尔科夫链|-t 50
--runtime|数字|运行X秒后中止会话|--runtime=10
--session|字符串|定义具体的会话名称|--session=mysession
--restore||从--session恢复会话|
--restore-disable||不写入恢复文件|
--restore-file-path|文件|指定恢复文件的路径|--restore-file-path=my.restore
-o,--outfile|文件|定义恢复的Hash的输出文件|-o outfile.txt
--outfile-format|数字|定义恢复的Hash的输出格式，参见下面的参考|--outfile-format=7
--outfile-autohex-disable||在输出纯文本文件中禁用$HEX[]|
--outfile-check-timer|数字|设置输出文件检查间隔为X秒|--outfile-check=30
-p,--separator|字符|Hash表和输出文件的分隔符|-p :
--stdout||不破解Hash，只打印候选值|
--show||比较Hash表和pot文件，显示已破解的Hash|
--left||比较Hash表和pot文件，显示未破解的Hash|
--username||忽略Hash文件中的用户名|
--remove||一旦破解，就删除Hash|
--remove-timer|数字|每X秒更新输入的Hash文件|--remove-timer=30
--potfile-disable||不写入pot文件|
--potfile-path|目录|指定pot文件的路径|--potfile-path=my.pot
--debug-mode|数字|定义调试模式(仅通过使用规则进行混合)|--debug-mode=4
--debug-file|文件|调试规则的输出文件|--debug-file=good.log
--induction-dir|目录|指定loopback的induction目录|--induction=inducts
--outfile-check-dir|目录|指定监控纯文本文件的输出目录|--outfile-check-dir=x
--logfile-disable||禁用日志文件|
--hccapx-message-pair|数字|只从hccapx加载匹配X的消息对|--hccapx-message-pair=2
--nonce-error-corrections|数字|用BF大小范围来取代AP最后字节的随机数|--nonce-error-corrections=16
--truecrypt-keyfiles|文件|要使用的密匙文件，用逗号分隔|--truecrypt-key=x.png
--veracrypt-keyfiles|文件|要使用的密匙文件，用逗号分隔|--veracrypt-key=x.txt
--veracrypt-pim|数字|VeraCrypt的头部密钥生成的迭代次数(PIM)|--veracrypt-pim=1000
-b,--benchmark||运行基准测试|
--speed-only||返回预期的攻击速度，然后退出|
--progress-only||返回理想进度的步骤大小和处理时间|
-c,--segment-size|数字|为wordfile设置 X MB缓存|-c 32
--bitmap-min|数字|设置位图最小为X位(bit)|--bitmap-min=24
--bitmap-max|数字|设置位图最大为X位(bit)|--bitmap-max=24
--cpu-affinity|字符串|设置CPU相关性，用逗号分隔|--cpu-affinity=1,2,3
-I,--opencl-info||显示检测到的OpenCL平台/设备的信息|-I
--opencl-platforms|字符串|要使用的OpenCL平台，用逗号分隔|--opencl-platforms=2
-d,--opencl-devices|字符串|要使用的OpenCL设备，用逗号分隔|-d 1
-D,--opencl-device-types|字符串|要使用的OpenCL设备类型，用逗号分隔|-D 1
--opencl-vector-width|数字|手动覆盖OpenCL矢量宽度为X|--opencl-vector=4
-w,--workload-profile|数字|设置工作负载配置文件，参见下面的参考|-w 3
-n,--kernel-accel|数字|手动调整工作负载，将外圈步长设置为X|-n 64
-u,--kernel-loops|数字|手动调整工作负载，将内圈步长设置为X|-u 256
--nvidia-spin-damp|数字|可变通NVIDIA处理器热循环Bug，用百分比表示|--nvidia-spin-damp=50
--gpu-temp-disable||禁用GPU温度和风扇速度的读取和触发|
--gpu-temp-abort|数字|如果GPU温度达到X摄氏度，则中止|--gpu-temp-abort=100
--gpu-temp-retain|数字|尝试将GPU温度保持在X摄氏度|--gpu-temp-retain=95
--powertune-enable||启用电源调整。 完成后恢复设置|
--scrypt-tmto|数字|手动覆盖scrypt的TMTO值为X|--scrypt-tmto=3
-s,--skip|数字|跳过前X个单词|-s 1000000
-l,--limit|数字|跳过单词后限制X个单词|-l 1000000
--keyspace||显示密钥空间base：mod值后退出|
-j,--rule-left|规则|单个规则应用于字典中左侧的每个单词|-j 'c'
-k,--rule-right|规则|单个规则应用于字典中右侧的每个单词|-k '^-'
-r,--rules-file|文件|多个规则应用于字典中的每个单词|-r rules/best64.rule
-g,--generate-rules|数字|生成X个随机规则|-g 10000
--generate-rules-func-min|数字|强制每个规则最小X个函数|
--generate-rules-func-max|数字|强制每个规则最大X个函数|
--generate-rules-seed|数字|强制RNG种子设置为X|
-1,--custom-charset1|字符集|用户定义的字符集 ?1|-1 ?l?d?u
-2,--custom-charset2|字符集|用户定义的字符集 ?2|-2 ?l?d?s
-3,--custom-charset3|字符集|用户定义的字符集 ?3|
-4,--custom-charset4|字符集|用户定义的字符集 ?4|
-i,--increment||启用掩码增量模式|
--increment-min|数字|在X处开始掩码递增|--increment-min=4
--increment-max|数字|在X处停止掩码递增|--increment-max=8

## Hash种类

编号|名称|类别
---|----|--------
900|MD4|纯Hash
0|MD5|纯Hash
5100|Half MD5|纯Hash
100|SHA1|纯Hash
1300|SHA-224|纯Hash
1400|SHA-256|纯Hash
10800|SHA-384|纯Hash
1700|SHA-512|纯Hash
5000|SHA-3 (Keccak)|纯Hash
10100|SipHash|纯Hash
6000|RIPEMD-160|纯Hash
6100|Whirlpool|纯Hash
6900|GOST R 34.11-94|纯Hash
11700|GOST R 34.11-2012 (Streebog) 256-bit|纯Hash
11800|GOST R 34.11-2012 (Streebog) 512-bit|纯Hash
10|md5($pass.$salt)|纯Hash，盐 且/或 多次迭代
20|md5($salt.$pass)|纯Hash，盐 且/或 多次迭代
30|md5(unicode($pass).$salt)|纯Hash，盐 且/或 多次迭代
40|md5($salt.unicode($pass))|纯Hash，盐 且/或 多次迭代
3800|md5($salt.$pass.$salt)|纯Hash，盐 且/或 多次迭代
3710|md5($salt.md5($pass))|纯Hash，盐 且/或 多次迭代
4010|md5($salt.md5($salt.$pass))|纯Hash，盐 且/或 多次迭代
4110|md5($salt.md5($pass.$salt))|纯Hash，盐 且/或 多次迭代
2600|md5(md5($pass))|纯Hash，盐 且/或 多次迭代
3910|md5(md5($pass).md5($salt))|纯Hash，盐 且/或 多次迭代
4300|md5(strtoupper(md5($pass)))|纯Hash，盐 且/或 多次迭代
4400|md5(sha1($pass))|纯Hash，盐 且/或 多次迭代
110|sha1($pass.$salt)|纯Hash，盐 且/或 多次迭代
120|sha1($salt.$pass)|纯Hash，盐 且/或 多次迭代
130|sha1(unicode($pass).$salt)|纯Hash，盐 且/或 多次迭代
140|sha1($salt.unicode($pass))|纯Hash，盐 且/或 多次迭代
4500|sha1(sha1($pass))|纯Hash，盐 且/或 多次迭代
4520|sha1($salt.sha1($pass))|纯Hash，盐 且/或 多次迭代
4700|sha1(md5($pass))|纯Hash，盐 且/或 多次迭代
4900|sha1($salt.$pass.$salt)|纯Hash，盐 且/或 多次迭代
14400|sha1(CX)|纯Hash，盐 且/或 多次迭代
1410|sha256($pass.$salt)|纯Hash，盐 且/或 多次迭代
1420|sha256($salt.$pass)|纯Hash，盐 且/或 多次迭代
1430|sha256(unicode($pass).$salt)|纯Hash，盐 且/或 多次迭代
1440|sha256($salt.unicode($pass))|纯Hash，盐 且/或 多次迭代
1710|sha512($pass.$salt)|纯Hash，盐 且/或 多次迭代
1720|sha512($salt.$pass)|纯Hash，盐 且/或 多次迭代
1730|sha512(unicode($pass).$salt)|纯Hash，盐 且/或 多次迭代
1740|sha512($salt.unicode($pass))|纯Hash，盐 且/或 多次迭代
50|HMAC-MD5 (key = $pass)|纯Hash，认证的
60|HMAC-MD5 (key = $salt)|纯Hash，认证的
150|HMAC-SHA1 (key = $pass)|纯Hash，认证的
160|HMAC-SHA1 (key = $salt)|纯Hash，认证的
1450|HMAC-SHA256 (key = $pass)|纯Hash，认证的
1460|HMAC-SHA256 (key = $salt)|纯Hash，认证的
1750|HMAC-SHA512 (key = $pass)|纯Hash，认证的
1760|HMAC-SHA512 (key = $salt)|纯Hash，认证的
14000|DES (PT = $salt, key = $pass)|纯加密，已知的明文攻击
14100|3DES (PT = $salt, key = $pass)|纯加密，已知的明文攻击
14900|Skip32 (PT = $salt, key = $pass)|纯加密，已知的明文攻击
400|phpass|通用密钥导出函数(KDF)
8900|scrypt|通用密钥导出函数(KDF)
11900|PBKDF2-HMAC-MD5|通用密钥导出函数(KDF)
12000|PBKDF2-HMAC-SHA1|通用密钥导出函数(KDF)
10900|PBKDF2-HMAC-SHA256|通用密钥导出函数(KDF)
12100|PBKDF2-HMAC-SHA512|通用密钥导出函数(KDF)
23|Skype|网络协议
2500|WPA/WPA2|网络协议
4800|iSCSI CHAP authentication, MD5(CHAP)|网络协议
5300|IKE-PSK MD5|网络协议
5400|IKE-PSK SHA1|网络协议
5500|NetNTLMv1|网络协议
5500|NetNTLMv1+ESS|网络协议
5600|NetNTLMv2|网络协议
7300|IPMI2 RAKP HMAC-SHA1|网络协议
7500|Kerberos 5 AS-REQ Pre-Auth etype 23|网络协议
8300|DNSSEC (NSEC3)|网络协议
10200|CRAM-MD5|网络协议
11100|PostgreSQL CRAM (MD5)|网络协议
11200|MySQL CRAM (SHA1)|网络协议
11400|SIP digest authentication (MD5)|网络协议
13100|Kerberos 5 TGS-REP etype 23|网络协议
121|SMF (Simple Machines Forum) > v1.1|论坛，内容管理系统(CMS)，电子商务，框架
400|phpBB3 (MD5)|论坛，内容管理系统(CMS)，电子商务，框架
2611|vBulletin < v3.8.5|论坛，内容管理系统(CMS)，电子商务，框架
2711|vBulletin >= v3.8.5|论坛，内容管理系统(CMS)，电子商务，框架
2811|MyBB 1.2+|论坛，内容管理系统(CMS)，电子商务，框架
2811|IPB2+ (Invision Power Board)|论坛，内容管理系统(CMS)，电子商务，框架
8400|WBB3 (Woltlab Burning Board)|论坛，内容管理系统(CMS)，电子商务，框架
11|Joomla < 2.5.18|论坛，内容管理系统(CMS)，电子商务，框架
400|Joomla >= 2.5.18 (MD5)|论坛，内容管理系统(CMS)，电子商务，框架
400|WordPress (MD5)|论坛，内容管理系统(CMS)，电子商务，框架
2612|PHPS|论坛，内容管理系统(CMS)，电子商务，框架
7900|Drupal7|论坛，内容管理系统(CMS)，电子商务，框架
21|osCommerce|论坛，内容管理系统(CMS)，电子商务，框架
21|xt:Commerce|论坛，内容管理系统(CMS)，电子商务，框架
11000|PrestaShop|论坛，内容管理系统(CMS)，电子商务，框架
124|Django (SHA-1)|论坛，内容管理系统(CMS)，电子商务，框架
10000|Django (PBKDF2-SHA256)|论坛，内容管理系统(CMS)，电子商务，框架
3711|MediaWiki B type|论坛，内容管理系统(CMS)，电子商务，框架
13900|OpenCart|论坛，内容管理系统(CMS)，电子商务，框架
4521|Redmine|论坛，内容管理系统(CMS)，电子商务，框架
4522|PunBB|论坛，内容管理系统(CMS)，电子商务，框架
12001|Atlassian (PBKDF2-HMAC-SHA1)|论坛，内容管理系统(CMS)，电子商务，框架
12|PostgreSQL|数据库服务器
131|MSSQL (2000)|数据库服务器
132|MSSQL (2005)|数据库服务器
1731|MSSQL (2012, 2014)|数据库服务器
200|MySQL323|数据库服务器
300|MySQL4.1/MySQL5|数据库服务器
3100|Oracle H: Type (Oracle 7+)|数据库服务器
112|Oracle S: Type (Oracle 11+)|数据库服务器
12300|Oracle T: Type (Oracle 12+)|数据库服务器
8000|Sybase ASE|数据库服务器
141|Episerver 6.x < .NET 4|HTTP，SMTP，LDAP服务器
1441|Episerver 6.x >= .NET 4|HTTP，SMTP，LDAP服务器
1600|Apache $apr1$ MD5, md5apr1, MD5 (APR)|HTTP，SMTP，LDAP服务器
12600|ColdFusion 10+|HTTP，SMTP，LDAP服务器
1421|hMailServer|HTTP，SMTP，LDAP服务器
101|nsldap, SHA-1(Base64), Netscape LDAP SHA|HTTP，SMTP，LDAP服务器
111|nsldaps, SSHA-1(Base64), Netscape LDAP SSHA|HTTP，SMTP，LDAP服务器
1411|SSHA-256(Base64), LDAP {SSHA256}|HTTP，SMTP，LDAP服务器
1711|SSHA-512(Base64), LDAP {SSHA512}|HTTP，SMTP，LDAP服务器
15000|FileZilla Server >= 0.9.55|FTP 服务器
11500|CRC32|校验和
3000|LM|操作系统
1000|NTLM|操作系统
1100|Domain Cached Credentials (DCC), MS Cache|操作系统
2100|Domain Cached Credentials 2 (DCC2), MS Cache 2|操作系统
12800|MS-AzureSync  PBKDF2-HMAC-SHA256|操作系统
1500|descrypt, DES (Unix), Traditional DES|操作系统
12400|BSDiCrypt, Extended DES|操作系统
500|md5crypt, MD5 (Unix), Cisco-IOS $1$ (MD5)|操作系统
3200|bcrypt $2*$, Blowfish (Unix)|操作系统
7400|sha256crypt $5$, SHA256 (Unix)|操作系统
1800|sha512crypt $6$, SHA512 (Unix)|操作系统
122|OSX v10.4, OSX v10.5, OSX v10.6|操作系统
1722|OSX v10.7|操作系统
7100|OSX v10.8+ (PBKDF2-SHA512)|操作系统
6300|AIX {smd5}|操作系统
6700|AIX {ssha1}|操作系统
6400|AIX {ssha256}|操作系统
6500|AIX {ssha512}|操作系统
2400|Cisco-PIX MD5|操作系统
2410|Cisco-ASA MD5|操作系统
500|Cisco-IOS $1$ (MD5)|操作系统
5700|Cisco-IOS type 4 (SHA256)|操作系统
9200|Cisco-IOS $8$ (PBKDF2-SHA256)|操作系统
9300|Cisco-IOS $9$ (scrypt)|操作系统
22|Juniper NetScreen/SSG (ScreenOS)|操作系统
501|Juniper IVE|操作系统
15100|Juniper/NetBSD sha1crypt|操作系统
7000|FortiGate (FortiOS)|操作系统
5800|Samsung Android Password/PIN|操作系统
13800|Windows Phone 8+ PIN/password|操作系统
8100|Citrix NetScaler|操作系统
8500|RACF|操作系统
7200|GRUB 2|操作系统
9900|Radmin2|操作系统
125|ArubaOS|操作系统
7700|SAP CODVN B (BCODE)|企业应用软件（EAS）
7800|SAP CODVN F/G (PASSCODE)|企业应用软件（EAS）
10300|SAP CODVN H (PWDSALTEDHASH) iSSHA-1|企业应用软件（EAS）
8600|Lotus Notes/Domino 5|企业应用软件（EAS）
8700|Lotus Notes/Domino 6|企业应用软件（EAS）
9100|Lotus Notes/Domino 8|企业应用软件（EAS）
133|PeopleSoft|企业应用软件（EAS）
13500|PeopleSoft PS_TOKEN|企业应用软件（EAS）
11600|7-Zip|压缩/存档
12500|RAR3-hp|压缩/存档
13000|RAR5|压缩/存档
13200|AxCrypt|压缩/存档
13300|AxCrypt in-memory SHA1|压缩/存档
13600|WinZip|压缩/存档
14700|iTunes 备份 < 10.0|备份
14800|iTunes 备份 >= 10.0|备份
62XY|TrueCrypt|全盘加密（FDE）
X|1 = PBKDF2-HMAC-RIPEMD160|全盘加密（FDE）
X|2 = PBKDF2-HMAC-SHA512|全盘加密（FDE）
X|3 = PBKDF2-HMAC-Whirlpool|全盘加密（FDE）
X|4 = PBKDF2-HMAC-RIPEMD160 + boot-mode|全盘加密（FDE）
Y|1 = XTS  512 bit pure AES|全盘加密（FDE）
Y|1 = XTS  512 bit pure Serpent|全盘加密（FDE）
Y|1 = XTS  512 bit pure Twofish|全盘加密（FDE）
Y|2 = XTS 1024 bit pure AES|全盘加密（FDE）
Y|2 = XTS 1024 bit pure Serpent|全盘加密（FDE）
Y|2 = XTS 1024 bit pure Twofish|全盘加密（FDE）
Y|2 = XTS 1024 bit cascaded AES-Twofish|全盘加密（FDE）
Y|2 = XTS 1024 bit cascaded Serpent-AES|全盘加密（FDE）
Y|2 = XTS 1024 bit cascaded Twofish-Serpent|全盘加密（FDE）
Y|3 = XTS 1536 bit all|全盘加密（FDE）
8800|Android FDE <= 4.3|全盘加密（FDE）
12900|Android FDE (Samsung DEK)|全盘加密（FDE）
12200|eCryptfs|全盘加密（FDE）
137XY|VeraCrypt|全盘加密（FDE）
X|1 = PBKDF2-HMAC-RIPEMD160|全盘加密（FDE）
X|2 = PBKDF2-HMAC-SHA512|全盘加密（FDE）
X|3 = PBKDF2-HMAC-Whirlpool|全盘加密（FDE）
X|4 = PBKDF2-HMAC-RIPEMD160 + boot-mode|全盘加密（FDE）
X|5 = PBKDF2-HMAC-SHA256|全盘加密（FDE）
X|6 = PBKDF2-HMAC-SHA256 + boot-mode|全盘加密（FDE）
Y|1 = XTS  512 bit pure AES|全盘加密（FDE）
Y|1 = XTS  512 bit pure Serpent|全盘加密（FDE）
Y|1 = XTS  512 bit pure Twofish|全盘加密（FDE）
Y|2 = XTS 1024 bit pure AES|全盘加密（FDE）
Y|2 = XTS 1024 bit pure Serpent|全盘加密（FDE）
Y|2 = XTS 1024 bit pure Twofish|全盘加密（FDE）
Y|2 = XTS 1024 bit cascaded AES-Twofish|全盘加密（FDE）
Y|2 = XTS 1024 bit cascaded Serpent-AES|全盘加密（FDE）
Y|2 = XTS 1024 bit cascaded Twofish-Serpent|全盘加密（FDE）
Y|3 = XTS 1536 bit all|全盘加密（FDE）
14600|LUKS|全盘加密（FDE）
9700|MS Office <= 2003 $0/$1, MD5 + RC4|文档
9710|MS Office <= 2003 $0/$1, MD5 + RC4, collider #1|文档
9720|MS Office <= 2003 $0/$1, MD5 + RC4, collider #2|文档
9800|MS Office <= 2003 $3/$4, SHA1 + RC4|文档
9810|MS Office <= 2003 $3/$4, SHA1 + RC4, collider #1|文档
9820|MS Office <= 2003 $3/$4, SHA1 + RC4, collider #2|文档
9400|MS Office 2007|文档
9500|MS Office 2010|文档
9600|MS Office 2013|文档
10400|PDF 1.1 - 1.3 (Acrobat 2 - 4)|文档
10410|PDF 1.1 - 1.3 (Acrobat 2 - 4), collider #1|文档
10420|PDF 1.1 - 1.3 (Acrobat 2 - 4), collider #2|文档
10500|PDF 1.4 - 1.6 (Acrobat 5 - 8)|文档
10600|PDF 1.7 Level 3 (Acrobat 9)|文档
10700|PDF 1.7 Level 8 (Acrobat 10 - 11)|文档
9000|Password Safe v2|密码管理软件
5200|Password Safe v3|密码管理软件
6800|LastPass + LastPass sniffed|密码管理软件
6600|1Password, agilekeychain|密码管理软件
8200|1Password, cloudkeychain|密码管理软件
11300|Bitcoin/Litecoin wallet.dat|密码管理软件
12700|Blockchain, My Wallet|密码管理软件
13400|KeePass 1 (AES/Twofish) and KeePass 2 (AES)|密码管理软件
99999|Plaintext|Blockchain明文，我的钱包

## 输出格式

编号|格式
---|-------
1|hash[:salt]
2|plain
3|hash[:salt]:plain
4|hex_plain
5|hash[:salt]:hex_plain
6|plain:hex_plain
7|hash[:salt]:plain:hex_plain
8|crackpos
9|hash[:salt]:crack_pos
10|plain:crack_pos
11|hash[:salt]:plain:crack_pos
12|hex_plain:crack_pos
13|hash[:salt]:hex_plain:crack_pos
14|plain:hex_plain:crack_pos
15|hash[:salt]:plain:hex_plain:crack_pos

## 调试模式规则

编号|格式
---|------
1|查找规则
2|原始词
3|原始词:查找规则
4|原始词:查找规则:已处理词

## 攻击模式

编号|模式
---|----
0|直接
1|组合
3|暴力穷举
6|混合 字典 + 掩码
7|混合 掩码 + 字典

## 内置字符集

?|字符集
-|-------
l|abcdefghijklmnopqrstuvwxyz
u|ABCDEFGHIJKLMNOPQRSTUVWXYZ
d|0123456789
h|0123456789abcdef
H|0123456789ABCDEF
s|!"#$%&'()*+,-./:;<=>?@[\]^_`{&#124;}~
a|?l?u?d?s
b|0x00 - 0xff

## OpenCL设备类型

编号|设备类型
---|-----------
1|CPU
2|GPU
3|现场可编程门阵列(FPGA)，数字信号处理器(DSP)，协处理器(Co-Processor)

## 工作负载配置文件

编号|性能|运行时间|能量消耗|桌面影响
---|-----------|-------|-----------------|--------------
1|低|2 ms|低|最小
2|默认|12 ms|经济型|可察觉
3|高|96 ms|高|没有反应
4|噩梦|480 ms|疯狂的|无法控制

## 基本用例

攻击模式|Hash种类|示例命令
----|----|---------------
字典|$P$|hashcat -a 0 -m 400 example400.hash example.dict
字典+规则|MD5|hashcat -a 0 -m 0 example0.hash example.dict -r rules/best64.rule
暴力穷举|MD5|hashcat -a 3 -m 0 example0.hash ?a?a?a?a?a?a
组合|MD5|hashcat -a 1 -m 0 example0.hash example.dict example.dict

如果您仍然不知道刚刚发生了什么，请尝试访问以下界面:

* https://hashcat.net/wiki/#howtos_videos_papers_articles_etc_in_the_wild
* https://hashcat.net/faq/
