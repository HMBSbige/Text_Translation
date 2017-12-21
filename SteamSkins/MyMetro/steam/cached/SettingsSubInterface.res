"steam/cached/SettingsSubInterface.res"
{
	"LanguageCombo"
	{
		"ControlName"		"ComboBox"
		"fieldName"		"LanguageCombo"
		"xpos"		"20"
		"ypos"		"40"
		"wide"		"280"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"1"
		"paintbackground"		"1"
		"textHidden"		"0"
		"editable"		"0"
		"maxchars"		"-1"
		"NumericInputOnly"		"0"
		"unicode"		"0"
	}
	"TranslationLabel"
	{
		"ControlName"		"URLLabel"
		"fieldName"		"TranslationLabel"
		"xpos"		"20"
		"ypos"		"66"
		"wide"		"436"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"0"
		"paintbackground"		"1"
		"labelText"		"#Steam_HelpUsTranslate"
		"textAlignment"		"west"
		"wrap"		"0"
		"URLText"		"http://translation.steampowered.com"
	}
	"Divider1"
	{
		"ControlName"		"Divider"
		"fieldName"		"Divider1"
		"xpos"		"20"
		"ypos"		"101"
		"wide"		"440"
		"tall"		"2"
		"AutoResize"	"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"0"
		"paintbackground"		"1"
	}
	"Label1" [$WINDOWS]
	{
		"ControlName"		"Label"
		"fieldName"		"Label1"
		"xpos"		"20"
		"ypos"		"117"
		"wide"		"402"
		"tall"		"30"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"0"
		"paintbackground"		"1"
		"appearance"		"LabelDull"
		"labelText"		"#TrackerUI_FavoriteWindowLabel_Windows"  
		"textAlignment"		"north-west"
		"wrap"		"1"
	}
	"Label1" [!$WINDOWS]
	{
		"ControlName"		"Label"
		"fieldName"		"Label1"
		"xpos"		"20"
		"ypos"		"117"
		"wide"		"402"
		"tall"		"30"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"0"
		"paintbackground"		"1"
		"appearance"		"LabelDull"
		"labelText"		"#TrackerUI_FavoriteWindowLabel"  
		"textAlignment"		"north-west"
		"wrap"		"1"
	}	
	"Label2"
	{
		"ControlName"		"Label"
		"fieldName"		"Label2"
		"xpos"		"20"
		"ypos"		"148"
		"wide"		"327"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"0"
		"paintbackground"		"1"
		"labelText"		"#TrackerUI_FavoriteWindow"
		"textAlignment"		"west"
		"associate"		"FavoriteWindowCombo"
		"wrap"		"0"
	}
	"FavoriteWindowCombo"
	{
		"ControlName"		"ComboBox"
		"fieldName"		"FavoriteWindowCombo"
		"xpos"		"20"
		"ypos"		"168"
		"wide"		"288"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"2"
		"paintbackground"		"1"
		"textHidden"		"0"
		"editable"		"0"
		"maxchars"		"-1"
		"NumericInputOnly"		"0"
		"unicode"		"0"
	}
	"Label3"
	{
		"ControlName"		"Label"
		"fieldName"		"Label3"
		"xpos"		"20"
		"ypos"		"207"
		"wide"		"416"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"0"
		"paintbackground"		"1"
		"appearance"		"LabelDull"
		"labelText"		"#Steam_SelectSkinToUse"
		"textAlignment"		"west"
		"associate"		"SkinCombo"
		"wrap"		"0"
	}
	"SkinCombo"
	{
		"ControlName"		"ComboBox"
		"fieldName"		"SkinCombo"
		"xpos"		"20"
		"ypos"		"227"
		"wide"		"280"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"3"
		"paintbackground"		"1"
		"textHidden"		"0"
		"editable"		"0"
		"maxchars"		"-1"
		"NumericInputOnly"		"0"
		"unicode"		"0"
	}
	"AutoLaunchCheck"
	{
		"ControlName"		"CheckButton"
		"fieldName"		"AutoLaunchCheck"
		"xpos"		"17"
		"ypos"		"260"
		"wide"		"430"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"4"
		"paintbackground"		"1"
		"labelText"		"#Steam_LaunchSteamOnStartup_Option"
		"textAlignment"		"west"
		"wrap"		"0"
		"Default"		"0"
		"selected"		"0"
	}
	"BigPictureModeCheck"
	{
		"ControlName"		"CheckButton"
		"fieldName"		"BigPictureModeCheck"
		"xpos"		"17"
		"ypos"		"285"
		"wide"		"430"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"5"
		"paintbackground"		"1"
		"labelText"		"#Steam_BPMOnStartup_Option"
		"textAlignment"		"west"
		"wrap"		"0"
		"Default"		"0"
		"selected"		"0"
	}
	"UrlBarCheck"
	{
		"ControlName"		"CheckButton"
		"fieldName"		"UrlBarCheck"
		"xpos"		"17"
		"ypos"		"310"
		"wide"		"430"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"6"
		"paintbackground"		"1"
		"labelText"		"#Steam_ShowUrlBar_Option"
		"textAlignment"		"west"
		"wrap"		"0"
		"Default"		"0"
		"selected"		"0"
	}
	"DWriteCheck" [!$OSX]
	{
		"ControlName"		"CheckButton"
		"fieldName"		"DWriteCheck"
		"xpos"		"17"
		"ypos"		"335"
		"wide"		"430"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"7"
		"paintbackground"		"1"
		"labelText"		"#Steam_UseDirectWrite_Option"
		"textAlignment"		"west"
		"wrap"		"0"
		"Default"		"0"
		"selected"		"0"
	}
	"Divider2"
	{
		"ControlName"		"Divider"
		"fieldName"		"Divider2"
		"xpos"		"20"
		"ypos"		"369"
		"wide"		"440"
		"tall"		"2"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"0"
		"paintbackground"		"1"
	}
	"NotifyAvailableGamesCheck"
	{
		"ControlName"		"CheckButton"
		"fieldName"		"NotifyAvailableGamesCheck"
		"xpos"		"17"
		"ypos"		"381"
		"wide"		"430"
		"tall"		"40"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"8"
		"paintbackground"		"1"
		"labelText"		"#Steam_Settings_NotifyMeWithSteamInstantMessages"
		"textAlignment"		"north-west"
		"wrap"		"1"
		"Default"		"0"
	}
	"Label4"
	{
		"ControlName"		"Label"
		"fieldName"		"Label4"
		"xpos"		"20"
		"ypos"		"19"
		"wide"		"475"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"0"
		"paintbackground"		"1"
		"labelText"		"#Steam_LanguageSelect"
		"textAlignment"		"west"
		"associate"		"LanguageCombo"
		"wrap"		"0"
	}
	
	"SetJumplistOptionsButton" [!$OSX]
	{
		"ControlName"		"Button"
		"fieldName"		"SetJumpListOptionsButton"
		"xpos"		"20"
		"ypos"		"434"
		"wide"		"295"
		"tall"		"24"
		"AutoResize"		"0"
		"PinCorner"		"0"
		"visible"		"1"
		"enabled"		"1"
		"tabPosition"		"9"
		"paintbackground"		"1"
		"labelText"		"#Steam_SetJumplistOptions"
		"textAlignment"		"west"
		"wrap"		"0"
		"Command"		"SetJumpListOptions"
		"Default"		"0"
		"selected"		"0"
	}
	styles
	{
		CSubPanelOptionsInterface
		{
			render_bg
			{
				0="image(x0,y0+7,x1,y1,graphics/metro/labels/settings/interface)"
			}
		}
	}
	layout
	{
		place { control="LanguageCombo" width=310 }
		place { control="FavoriteWindowCombo" width=310 }
		place { control="SkinCombo" width=310 }
		place { control="Label4,LanguageCombo,TranslationLabel" y=17 margin-top=16 height=24 dir=down }
		place { start=TranslationLabel control="Label2,FavoriteWindowCombo" y=8 height=24 dir=down }
		place { start=FavoriteWindowCombo control="Label3,SkinCombo" y=8 height=24 dir=down }
		place { start=SkinCombo control="AutoLaunchCheck,BigPictureModeCheck,UrlBarCheck,DWriteCheck,H264HWAccelCheck,NotifyAvailableGamesCheck" y=8 spacing=4 width=max dir=down }
		place { start=NotifyAvailableGamesCheck control="SetJumpListOptionsButton" dir=down }
		
		//Hidden
		place { control="Label1,Divider1,Divider2" height=0 }
	}
}