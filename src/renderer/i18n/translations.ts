export type Lang =
	| 'enUS'
	| 'deDE'
	| 'zhCN'
	| 'esES'
	| 'ptBR'
	| 'ruRU'
	| 'koKR'
	| 'frFR';

type Dict = Record<string, string>;

const enUS: Dict = {
	'tab.news': 'News',
	'tab.tweaks': 'Tweaks',
	'tab.addons': 'Addons',
	'tab.mods': 'Mods',
	'topbar.settings': 'Settings',
	'topbar.minimize': 'Minimize',
	'topbar.maximize': 'Maximize',
	'topbar.restore': 'Restore',
	'topbar.quit': 'Quit',
	'topbar.language': 'Language',
	'quit.title': 'Quit?',
	'quit.warn':
		'Your game is currently being updated. Quitting now may cause problems.',
	'quit.return': 'Return',
	'launch.verifying': 'Verifying',
	'launch.play': 'Play',
	'launch.retry': 'Retry',
	'launch.install': 'Install',
	'launch.update': 'Update',
	'launch.updating': 'Updating',
	'launch.cancel': 'Cancel',
	'update.cancelled':
		'Download stopped. Click Update to continue where it left off.',
	'update.stalled':
		'The download stopped making progress. Click Retry to try again.',
	'update.diskFullSize':
		"Not enough free disk space: the download needs about {size} more on the game's drive. Free up space, then click Retry.",
	'update.diskFull':
		"Not enough free disk space on the game's drive. Free up some space, then click Retry.",
	'update.network':
		'Could not reach the download servers. Check your connection, then click Retry.',
	'update.fileAccess':
		'Could not write the game files. Close the game and anything using its folder, check your antivirus, then click Retry.',
	'update.downloaderMissing':
		'The downloader (aria2c.exe) is missing, most likely removed by your antivirus. Restore it from quarantine or reinstall the launcher, then click Retry.',
	'launch.applying': 'Applying',
	'launch.updateAvailable': 'Update available!',
	'launch.modsChanged': 'Mods changed, apply before playing',
	'launch.upToDate': 'Everything up to date!',
	'launch.version': 'Version: {version}',
	'launch.errorLabel': 'Error:',
	'launch.serverFail': 'Failed to reach update server',
	'launch.localVersion': 'You can launch local version {version}',
	'launch.tryLater': 'Please try again later',
	'launch.verifyHint': 'Verify your game data by clicking Retry.',
	'launch.remaining': 'remaining',
	'launch.calculating': 'calculating…',
	'launch.onDisk': 'on disk',
	'launch.blockedByAntivirus':
		'Your antivirus stopped the game from starting. Add the game folder as an exception (Settings, "Allow through antivirus"), then click Play again.',
	'launch.updateFirst':
		'A game update came out while the launcher was open. Let the launcher finish checking and updating, then click Play.',
	'tweaks.raidVisuals.label': 'Updated Raid Visuals',
	'tweaks.raidVisuals.text':
		'Optional ~9 MB download. Adds clearer ground markers and sounds for raid boss abilities, kept in sync with the server automatically. (AKA Patch-O)',
	'tweaks.alwaysAutoLoot.label': 'Always auto-loot',
	'tweaks.alwaysAutoLoot.text':
		'Reverses auto-loot behavior to always auto-loot and disable auto-with bound key.',
	'tweaks.largeAddress.label': 'Large Address Aware',
	'tweaks.largeAddress.text': 'Allows the game to use more than 2GB of memory.',
	'tweaks.nameplateRange.label': 'Nameplate range',
	'tweaks.nameplateRange.text':
		'Increases distance at which nameplates are visible. [Vanilla: 20] [Classic: 41]',
	'tweaks.cameraHeading': 'Camera',
	'tweaks.fieldOfView.label': 'Field of View',
	'tweaks.fieldOfView.text':
		'Recommended for widescreen window resolutions. [Vanilla: 90] [Tweaks: 110]',
	'tweaks.farClip.label': 'Render distance',
	'tweaks.farClip.text':
		'Increases maximum render distance. Very high values can crash the game on world entry. [Vanilla: 777]',
	'tweaks.farClip.recommendedHint': 'Recommended for your PC: {value}.',
	'tweaks.frillDistance.label': 'Ground clutter distance',
	'tweaks.frillDistance.text':
		'Changes ground clutter render distance. [Vanilla: 70] [Tweaks: 300]',
	'tweaks.cameraDistance.label': 'Camera distance',
	'tweaks.cameraDistance.text':
		'Increases maximum camera (zoom out) distance. [Vanilla: 50] [Max:100]',
	'tweaks.soundsHeading': 'Sounds',
	'tweaks.soundInBackground.label': 'Background sounds',
	'tweaks.soundInBackground.text':
		'Allows game sounds to play while the game is minimized.',
	'tweaks.applyFailed': 'Failed to apply tweaks: {message}',
	'tweaks.highlighted': 'Highlighted',
	'tweaks.recommendedNote': 'options are recommended and enabled by default',
	'tweaks.reset': 'Reset',
	'tweaks.apply': 'Apply',
	'misc.newsTitle': 'News',
	'misc.announcementsTitle': 'Announcements',
	'misc.patchNotesTitle': 'Patch Notes',
	'misc.newsByAuthor': 'by {author}',
	'misc.newsReadMore': 'Read more',
	'misc.refresh': 'Refresh',
	'misc.newsLoading': 'Loading news...',
	'misc.newsError': "Couldn't reach the news feed.",
	'misc.newsEmpty': 'No news yet. Check back later.',
	'misc.tryAgain': 'Try again',
	'forum.title': 'Nautilus News Network',
	'forum.readFullPost': 'Read full post on the forum',
	'forum.loading': 'Loading latest dispatch...',
	'forum.error': "Couldn't reach the forum.",
	'forum.empty': 'No dispatches yet.',
	'misc.comingSoon': 'Coming soon...',
	'misc.selfUpdateCheckFailed': 'Update check failed',
	'misc.selfUpdateAvailable':
		'Launcher update {version} available, preparing download…',
	'misc.selfUpdateDownloading': 'Downloading update {version} · {percent}%',
	'misc.selfUpdateReady': 'Launcher update {version} ready to install',
	'misc.selfUpdateInstallNow': 'Install now',
	'misc.tabCrashed': '{tab} crashed',
	'misc.somethingWentWrong': 'Something went wrong!',
	'misc.uncaughtError': 'Uncaught {name}: {message}',
	'misc.unknownError': 'Unknown error',
	'misc.copyError': 'Copy error',
	'misc.reload': 'Reload',
	'misc.close': 'Close',
	'misc.pickFile': 'Pick file',
	'mods.update': 'update',
	'mods.ignoreUpdates': 'Ignore updates',
	'mods.ownFile': 'Your own file',
	'mods.ownFileHint':
		'You replaced {files} with your own copy. The launcher keeps it and never changes it, whether this mod is ticked or not.',
	'mods.useLauncherVersion': 'Use launcher version',
	'mods.useLauncherVersionHint':
		"Puts the launcher's {files} back. Your copy is replaced and not kept.",
	'mods.title': 'CUSTOM MODS',
	'mods.unsavedChanges': 'unsaved changes',
	'mods.warning':
		'Enabling custom mods may not provide any performance benefits or may even cause game crashes depending on your system. Please try disabling them if you experience any issues.',
	'mods.enableRequired': 'Enable {mods}, required by your selected mods.',
	'mods.depRequired': '{mod} must be enabled. It is required by {requiredBy}.',
	'mods.missingFiles':
		'Missing game files for: {mods}. Re-sync your client to restore them. If antivirus is blocking them, allow them through first.',
	'mods.reverify': 'Re-sync client',
	'mods.yourDlls': 'Your DLL mods',
	'mods.yourDllsEmpty':
		'Drop a .dll into your game folder, or add one below, to toggle it here.',
	'mods.addDll': 'Add DLL',
	'mods.addDllTitle': 'Choose a DLL mod',
	'mods.addDllFailed': 'Failed to add DLL.',
	'mods.highlighted': 'Highlighted',
	'mods.highlightedRecommended': 'mods are recommended.',
	'mods.apply': 'Apply',
	'mods.applied': 'Applied',
	'mods.cantApplyYet': "CAN'T APPLY YET",
	'mods.close': 'Close',
	'av.blockedTitle': 'BLOCKED BY ANTIVIRUS',
	'av.blockedOne': 'Windows Defender blocked this mod:',
	'av.blockedMany': 'Windows Defender blocked these mods:',
	'av.blockedExplain':
		'These are safe community mods that Defender mis-flags. Allow them once, then try again.',
	'av.whyHappening': 'Why is this happening?',
	'av.allowThrough': 'Allow through antivirus',
	'av.addedRetry': 'Added. Close this and try again.',
	'av.close': 'Close',
	'av.whyTitle': 'WHY ANTIVIRUS FLAGS MODS',
	'av.whyIntro':
		'Some of the mods the launcher installs get flagged by Windows Defender (or other antivirus) as a threat such as "{detection}". This is a',
	'av.falsePositive': 'false positive',
	'av.whatSetsItOff': 'What sets it off',
	'av.whatSetsItOffIntro':
		'These mods modernize the 20-year-old 1.12 game client using two techniques that look suspicious to antivirus heuristics:',
	'av.dllInjection': 'DLL injection',
	'av.dllInjectionText':
		'the mods load extra code into the running game to add features (ping compensation, better nameplates, performance). Loading code into another program is also something malware does, so the behavior alone trips the scanner.',
	'av.exePatching': 'Executable patching',
	'av.exePatchingText':
		'some mods edit WoW.exe to lift old engine limits (for example letting the 32-bit client use 4GB of RAM instead of 2GB). Modifying an executable is another common malware pattern.',
	'av.heuristicNote':
		'Because these are behavior-based detections, not matches against real malware, legitimate mods that use them get caught as generic "trojan" or "hacktool" false positives.',
	'av.whatModsDo': 'What the mods actually do',
	'av.modVanillaFixes':
		'the loader that fixes stutter and timer bugs and starts the other mods.',
	'av.modNampower':
		'ping compensation so casts feel responsive on higher latency.',
	'av.modSuperWowUnitXp':
		'advanced Lua, real nameplates, camera and targeting upgrades.',
	'av.modDxvk':
		'translates the old DirectX 9 to modern Vulkan for big FPS gains.',
	'av.howToVerify': 'How to verify these claims',
	'av.howToVerifyText':
		'These are open-source community projects. You can read every line of each mod\'s code from the source link next to it in the Mods list, and you can look up the detection name (for example "{detection}") to see it is a documented false positive on these tools.',
	'av.whatAllowDoesTitle': 'What does "Allow through antivirus" do',
	'av.whatAllowDoesIntro':
		"It asks Windows for administrator permission (one prompt, click Yes), then runs Windows' own built-in",
	'av.whatAllowDoesIntroAfter':
		'command to add a few entries to the Windows Defender exclusion list:',
	'av.exclusionFoldersBefore': 'Your',
	'av.gameFolder': 'game folder',
	'av.exclusionFoldersAnd': 'and the',
	'av.launcherFolder': 'launcher folder',
	'av.exclusionFoldersAfter':
		', so the mod files in them are no longer scanned or quarantined.',
	'av.exclusionExesAnd': 'and',
	'av.exclusionExesAfter':
		'as allowed processes, so they are not blocked while running.',
	'av.whatAllowDoesOutro':
		'This is the same thing you would do by hand under Windows Security, Virus and threat protection, Exclusions. It installs nothing, runs no third-party software, and changes nothing outside those specific paths.',
	'av.back': 'Back',
	'av.howToAllowTitle': 'How to allow the mods through',
	'av.guideIntro':
		'The launcher does not change your antivirus settings itself, because Windows Defender treats apps that do that as malware. Adding the exclusion yourself in Windows Security only takes a moment.',
	'av.step1':
		'1. Open Windows Security, scroll to Exclusions and choose "Add or remove exclusions", then "Add an exclusion" > "Folder", and add each of these folders:',
	'av.openWindowsSecurity': 'Open Windows Security',
	'av.openFailed':
		'Windows Security did not open. Find it in the Start menu, then go to Virus & threat protection > Manage settings > Add or remove exclusions.',
	'av.copy': 'Copy',
	'av.copied': 'Copied',
	'av.step2': '2. Then restore the files Defender removed:',
	'av.restoreFiles': 'Restore blocked files',
	'av.checkAgain': 'Check again',
	'av.allClear': 'Nothing is blocked any more. You are ready to play.',
	'av.checking': 'Checking...',
	'av.checkStillBlocked':
		'Still blocked: {files}. Make sure both folders are in the exclusion list, then use "Restore blocked files".',
	'av.checkFailed': 'Could not check right now. Please try again in a moment.',
	'av.restoring': 'Restoring the files. This can take a minute.',
	'av.restoreDoneFiles':
		'Restored {files}. Nothing is blocked any more. You are ready to play.',
	'av.restorePartial':
		'Restored {restored}, but these are still blocked: {files}. Check that both folders are in the exclusion list, then try again.',
	'av.restoreNone':
		'These are still blocked: {files}. Check that both folders are in the exclusion list, then try again. If they stay blocked, restore them in Windows Security under Protection history.',
	'av.restoreNoClient': 'Set your game folder first, then try again.',
	'av.restoreGameRunning': 'Close the game first, then try again.',
	'av.restoreBusy':
		'The launcher is already updating the game. Wait for it to finish, then try again.',
	'av.restoreServer':
		'The download server could not be reached. Please try again in a few minutes.',
	'av.restoreIncomplete':
		'Some files could not be downloaded yet. Please try again in a few minutes.',
	'av.restoreFailed':
		'The files could not be restored. Please try again, or use Verify game files in Settings.',
	'av.howToAllowText':
		'In Windows Security, go to Virus & threat protection > Manage settings > Add or remove exclusions, and add your game folder and the launcher folder as Folder exclusions. Defender then stops scanning and removing the mod files in those two folders. Then use "Restore blocked files" (or Verify game files in Settings) to bring back anything it already removed.',
	'av.howToAllowSafety':
		'The launcher does not do this for you on purpose: apps that change antivirus settings on their own look like malware to Windows Defender. Adding the exclusion yourself is the safe way, and you can remove it again at any time from the same screen.',
	'addons.sectionInstalled': 'Installed',
	'addons.sectionRecommended': 'Recommended',
	'addons.sectionAvailable': 'Available',
	'addons.checkForUpdates': 'Check for updates',
	'addons.addCustomGitAddon': 'Add custom git addon',
	'addons.updateAll': 'Update all',
	'addons.everythingUpToDate': 'Everything is up to date.',
	'addons.installAddon': 'Install addon',
	'addons.previewAlt': 'Preview',
	'addons.readyToInstall': 'Ready to install',
	'addons.invalidGitUrl': 'Not a valid git repository URL',
	'addons.install': 'Install',
	'addons.warnIncorrectVersionFull':
		'This addon seems to be made for different game version ({version}) and it may not function correctly',
	'addons.warnIncorrectVersionShort': 'Incorrect version',
	'addons.warnMissingDependenciesFull':
		'This addon has missing dependencies: {deps}',
	'addons.warnMissingDependenciesShort': 'Missing dependencies',
	'addons.details': 'Details',
	'addons.openOnGithub': 'Open {url} on GitHub',
	'addons.upToDate': 'Up to date',
	'addons.notVersioned': 'Not versioned',
	'addons.update': 'Update',
	'addons.ownCopy': 'Your own copy',
	'addons.ownCopyHint':
		'This copy of {name} was not installed by the launcher, so it is yours. The launcher keeps it and does not update it.',
	'addons.useLauncherVersion': 'Use launcher version',
	'addons.useLauncherVersionHint':
		"Installs the launcher's version of this addon. Your copy is replaced and not kept.",
	'addons.edited': 'Edited',
	'addons.editedHint':
		'You changed files in this addon. Updating it replaces your changes.',
	'addons.download': 'Download',
	'addons.deleteConfirmTitle': 'Are you sure?',
	'addons.deleteConfirmBody': 'Are you sure you want to delete {folder} addon?',
	'addons.deleteConfirmFiles':
		'This will delete all files in the addon folder.',
	'addons.delete': 'Delete',
	'addons.remove': 'Remove',
	'addons.detailSource': 'Source',
	'addons.openOnGithubShort': 'Open on GitHub',
	'addons.detailContributions': 'Contributions',
	'addons.detailAddonVersion': 'Addon version',
	'addons.detailDependencies': 'Dependencies',
	'addons.optional': '(optional)',
	'prefs.mirrorOffline': 'offline',
	'prefs.mirrorChecking': 'checking…',
	'prefs.mirrorOnline': 'online',
	'prefs.title': 'SETTINGS',
	'prefs.installLocation': 'INSTALL LOCATION:',
	'prefs.openFolder': 'Open folder',
	'prefs.notSelected': 'Not selected',
	'prefs.change': 'Change',
	'prefs.downloadMirror': 'DOWNLOAD MIRROR:',
	'prefs.recheck': 'Re-check',
	'prefs.troubleshooting': 'TROUBLESHOOTING:',
	'prefs.verifyGameFiles': 'Verify game files',
	'prefs.openLogFile': 'Open log file',
	'prefs.allowThroughAntivirus': 'Allow through antivirus',
	'prefs.exclusionAdded': 'Added. Re-verify game files if any were removed.',
	'prefs.generalSettings': 'GENERAL SETTINGS:',
	'prefs.cleanWdb': 'Clean WDB on each launch',
	'prefs.minimizeToTray': 'Minimize to tray while playing',
	'prefs.shareDownloads': 'Help share downloads with other players',
	'prefs.proton': 'PROTON:',
	'prefs.useProton': 'Start the game with Proton',
	'prefs.protonVersion': 'Proton version',
	'prefs.protonNone':
		"No Proton found. Install Proton in Steam, or put GE-Proton in Steam's compatibilitytools.d folder.",
	'launch.protonMissing':
		'The Proton version chosen in Settings was not found. Choose another one, or turn Proton off, then click Play again.',
	'prefs.save': 'Save',
	'prefs.installLocationTitle': 'Install location',
	'prefs.portableInfo':
		'You are using the portable version of the launcher. Install location is determined by the location of the launcher executable.',
	'prefs.errorLabel': 'Error: ',
	'prefs.wowExeNotFound':
		'{exe} not found in current folder. Please close the launcher and move it to your WoW 1.12 client directory.',
	'prefs.selectDirectory':
		'Select a directory for the game client installation.',
	'prefs.upgradeExisting':
		'You may also choose a directory with an existing Turtle WoW or Vanilla WoW installation, and it will be automatically upgraded.',
	'prefs.installDirectory': 'Install directory:',
	'prefs.noClientHere':
		'No {exe} in this folder. The launcher will download a fresh client here, and it will not contain your existing addons or settings. If you already have an install, pick that folder instead.',
	'prefs.noClientHereConfirm':
		'I understand — download a fresh client into this folder',
	'prefs.confirm': 'Confirm',
	'priority.active': 'Priority login active',
	'priority.signOut': 'Sign out',
	'priority.signIn': 'Sign in for priority login',
	'priority.tryAgain': 'Try priority login again',
	'priority.finishInBrowser':
		'Finish signing in in your web browser, then come back here.',
	'priority.standardLogin': 'Using the standard login.',
	'priority.accountTooNew':
		'Your account must be at least 24 hours old to use priority login.',
	'priority.notGoodStanding':
		'This account is not eligible for priority login.',
	'priority.emailUnverified': 'Verify your email to use priority login.',
	'priority.hostingOrVpn':
		'Priority login is not available on VPN or hosting connections. Please connect from your home network.',
	'priority.sharedVpnIp':
		'Another account is already using priority login on this VPN connection. Switch your connection or use the standard login.',
	'priority.notOnThisConnection':
		'Priority login is not available on this connection.',
	'priority.noCharacter':
		'Play on your account first to unlock priority login.',
	'priority.notInRollout':
		'Priority login is not enabled for your account yet. Using the standard login.',
	'priority.notAvailableNow':
		'Priority login is not available right now. Using the standard login.'
};

const deDE: Dict = {
	'tab.news': 'Neuigkeiten',
	'tab.tweaks': 'Optimierungen',
	'tab.addons': 'Addons',
	'tab.mods': 'Mods',
	'topbar.settings': 'Einstellungen',
	'topbar.minimize': 'Minimieren',
	'topbar.maximize': 'Maximieren',
	'topbar.restore': 'Wiederherstellen',
	'topbar.quit': 'Beenden',
	'topbar.language': 'Sprache',
	'quit.title': 'Beenden?',
	'quit.warn':
		'Dein Spiel wird gerade aktualisiert. Ein Beenden kann Probleme verursachen.',
	'quit.return': 'Zurück',
	'launch.verifying': 'Überprüfung',
	'launch.play': 'Spielen',
	'launch.retry': 'Erneut',
	'launch.install': 'Installieren',
	'launch.update': 'Aktualisieren',
	'launch.updating': 'Aktualisierung',
	'launch.cancel': 'Abbrechen',
	'update.cancelled':
		'Download angehalten. Klicke auf „Aktualisieren“, um dort weiterzumachen, wo er aufgehört hat.',
	'update.stalled':
		'Der Download kommt nicht mehr voran. Klicke auf „Erneut“, um es noch einmal zu versuchen.',
	'update.diskFullSize':
		'Nicht genug freier Speicherplatz: Der Download braucht auf dem Laufwerk des Spiels noch etwa {size}. Gib Speicherplatz frei und klicke dann auf „Erneut“.',
	'update.diskFull':
		'Nicht genug freier Speicherplatz auf dem Laufwerk des Spiels. Gib etwas Speicherplatz frei und klicke dann auf „Erneut“.',
	'update.network':
		'Die Download-Server sind nicht erreichbar. Prüfe deine Verbindung und klicke dann auf „Erneut“.',
	'update.fileAccess':
		'Die Spieldateien konnten nicht geschrieben werden. Schließe das Spiel und alles, was seinen Ordner benutzt, prüfe dein Antivirenprogramm und klicke dann auf „Erneut“.',
	'update.downloaderMissing':
		'Das Download-Programm (aria2c.exe) fehlt, vermutlich hat dein Antivirenprogramm es entfernt. Stelle es aus der Quarantäne wieder her oder installiere den Launcher neu und klicke dann auf „Erneut“.',
	'launch.applying': 'Anwenden',
	'launch.updateAvailable': 'Update verfügbar!',
	'launch.modsChanged': 'Mods geändert, vor dem Spielen anwenden',
	'launch.upToDate': 'Alles aktuell!',
	'launch.version': 'Version: {version}',
	'launch.errorLabel': 'Fehler:',
	'launch.serverFail': 'Update-Server nicht erreichbar',
	'launch.localVersion': 'Du kannst die lokale Version {version} starten',
	'launch.tryLater': 'Bitte versuche es später erneut',
	'launch.verifyHint':
		'Überprüfe deine Spieldaten, indem du auf „Erneut“ klickst.',
	'launch.remaining': 'verbleibend',
	'launch.calculating': 'wird berechnet…',
	'launch.onDisk': 'auf der Festplatte',
	'launch.blockedByAntivirus':
		'Dein Antivirenprogramm hat den Start des Spiels verhindert. Füge den Spielordner als Ausnahme hinzu (Einstellungen, „Im Antivirenprogramm zulassen“) und klicke dann erneut auf „Spielen“.',
	'launch.updateFirst':
		'Während der Launcher geöffnet war, ist ein Spielupdate erschienen. Lass den Launcher die Prüfung und Aktualisierung abschließen und klicke dann auf „Spielen“.',
	'tweaks.raidVisuals.label': 'Aktualisierte Raid-Effekte',
	'tweaks.raidVisuals.text':
		'Optionaler Download (~9 MB). Fügt deutlichere Bodenmarkierungen und Sounds für Raidboss-Fähigkeiten hinzu, automatisch mit dem Server synchron gehalten. (auch bekannt als Patch-O)',
	'tweaks.alwaysAutoLoot.label': 'Immer automatisch plündern',
	'tweaks.alwaysAutoLoot.text':
		'Kehrt das Auto-Plündern-Verhalten um, sodass immer automatisch geplündert wird und das Auto-Plündern per Tastenkombination deaktiviert ist.',
	'tweaks.largeAddress.label': 'Large Address Aware',
	'tweaks.largeAddress.text':
		'Erlaubt dem Spiel, mehr als 2 GB Arbeitsspeicher zu nutzen.',
	'tweaks.nameplateRange.label': 'Namensplaketten-Reichweite',
	'tweaks.nameplateRange.text':
		'Erhöht die Entfernung, in der Namensplaketten sichtbar sind. [Vanilla: 20] [Classic: 41]',
	'tweaks.cameraHeading': 'Kamera',
	'tweaks.fieldOfView.label': 'Sichtfeld',
	'tweaks.fieldOfView.text':
		'Empfohlen für Breitbild-Fensterauflösungen. [Vanilla: 90] [Tweaks: 110]',
	'tweaks.farClip.label': 'Sichtweite',
	'tweaks.farClip.text':
		'Erhöht die maximale Sichtweite. Sehr hohe Werte können beim Betreten der Welt zum Absturz führen. [Vanilla: 777]',
	'tweaks.farClip.recommendedHint': 'Empfohlen für deinen PC: {value}.',
	'tweaks.frillDistance.label': 'Bodendetail-Distanz',
	'tweaks.frillDistance.text':
		'Ändert die Renderdistanz für Bodendetails. [Vanilla: 70] [Tweaks: 300]',
	'tweaks.cameraDistance.label': 'Kameradistanz',
	'tweaks.cameraDistance.text':
		'Erhöht die maximale Kameradistanz (Herauszoomen). [Vanilla: 50] [Max:100]',
	'tweaks.soundsHeading': 'Töne',
	'tweaks.soundInBackground.label': 'Hintergrundton',
	'tweaks.soundInBackground.text':
		'Lässt die Spieltöne weiterlaufen, während das Spiel minimiert ist.',
	'tweaks.applyFailed': 'Tweaks konnten nicht angewendet werden: {message}',
	'tweaks.highlighted': 'Hervorgehoben',
	'tweaks.recommendedNote':
		'Optionen werden empfohlen und sind standardmäßig aktiviert',
	'tweaks.reset': 'Zurücksetzen',
	'tweaks.apply': 'Anwenden',
	'mods.update': 'Aktualisieren',
	'mods.ignoreUpdates': 'Updates ignorieren',
	'mods.ownFile': 'Eigene Datei',
	'mods.ownFileHint':
		'Du hast {files} durch eine eigene Kopie ersetzt. Der Launcher behält sie und ändert sie nie, egal ob diese Mod aktiviert ist oder nicht.',
	'mods.useLauncherVersion': 'Launcher-Version verwenden',
	'mods.useLauncherVersionHint':
		'Stellt {files} aus dem Launcher wieder her. Deine Kopie wird ersetzt und nicht aufbewahrt.',
	'mods.title': 'BENUTZERDEFINIERTE MODS',
	'mods.unsavedChanges': 'nicht gespeicherte Änderungen',
	'mods.warning':
		'Das Aktivieren benutzerdefinierter Mods bringt je nach System möglicherweise keine Leistungsvorteile oder kann sogar zu Spielabstürzen führen. Bitte deaktiviere sie, falls Probleme auftreten.',
	'mods.enableRequired':
		'Aktiviere {mods}, die von deinen ausgewählten Mods benötigt werden.',
	'mods.depRequired':
		'{mod} muss aktiviert sein. Es wird von {requiredBy} benötigt.',
	'mods.highlighted': 'Hervorgehoben',
	'mods.highlightedRecommended': 'Mods werden empfohlen.',
	'mods.apply': 'Anwenden',
	'mods.cantApplyYet': 'NOCH NICHT ANWENDBAR',
	'mods.close': 'Schließen',
	'av.blockedTitle': 'VOM ANTIVIRENPROGRAMM BLOCKIERT',
	'av.blockedOne': 'Windows Defender hat diesen Mod blockiert:',
	'av.blockedMany': 'Windows Defender hat diese Mods blockiert:',
	'av.blockedExplain':
		'Das sind sichere Community-Mods, die der Defender fälschlicherweise meldet. Erlaube sie einmal und versuche es dann erneut.',
	'av.whyHappening': 'Warum passiert das?',
	'av.allowThrough': 'Im Antivirenprogramm zulassen',
	'av.addedRetry': 'Hinzugefügt. Schließe dies und versuche es erneut.',
	'av.close': 'Schließen',
	'av.whyTitle': 'WARUM ANTIVIRENPROGRAMME MODS MELDEN',
	'av.whyIntro':
		'Einige der vom Launcher installierten Mods werden von Windows Defender (oder anderen Antivirenprogrammen) als Bedrohung wie z. B. "{detection}" gemeldet. Dabei handelt es sich um einen',
	'av.falsePositive': 'Fehlalarm',
	'av.whatSetsItOff': 'Was den Alarm auslöst',
	'av.whatSetsItOffIntro':
		'Diese Mods modernisieren den 20 Jahre alten 1.12-Spielclient mit zwei Techniken, die für die Heuristik von Antivirenprogrammen verdächtig aussehen:',
	'av.dllInjection': 'DLL-Injektion',
	'av.dllInjectionText':
		'Die Mods laden zusätzlichen Code in das laufende Spiel, um Funktionen hinzuzufügen (Ping-Kompensation, bessere Namensplaketten, Leistung). Das Laden von Code in ein anderes Programm ist auch etwas, das Schadsoftware tut, daher löst allein dieses Verhalten den Scanner aus.',
	'av.exePatching': 'Patchen der ausführbaren Datei',
	'av.exePatchingText':
		'Einige Mods bearbeiten WoW.exe, um alte Engine-Limits aufzuheben (zum Beispiel, damit der 32-Bit-Client 4 GB RAM statt 2 GB nutzen kann). Das Verändern einer ausführbaren Datei ist ein weiteres schadsoftwareähnliches Muster.',
	'av.heuristicNote':
		'Da es sich um verhaltensbasierte (heuristische) Erkennungen handelt und nicht um Übereinstimmungen mit echter Schadsoftware, werden legitime Mods, die diese Techniken nutzen, fälschlicherweise als allgemeine "Trojaner"- oder "Hacktool"-Bedrohung eingestuft.',
	'av.whatModsDo': 'Was die Mods tatsächlich tun',
	'av.modVanillaFixes':
		'der Loader, der Ruckler und Timer-Fehler behebt und die anderen Mods startet.',
	'av.modNampower':
		'Ping-Kompensation, damit sich Zauber bei höherer Latenz reaktionsschnell anfühlen.',
	'av.modSuperWowUnitXp':
		'erweitertes Lua, echte Namensplaketten, Kamera- und Zielerfassungs-Verbesserungen.',
	'av.modDxvk':
		'übersetzt das alte DirectX 9 in das moderne Vulkan für große FPS-Gewinne.',
	'av.howToVerify': 'Wie du diese Angaben überprüfen kannst',
	'av.howToVerifyText':
		'Das sind quelloffene Community-Projekte. Du kannst jede Zeile des Codes jedes Mods über den Quell-Link daneben in der Mods-Liste einsehen, und du kannst den Erkennungsnamen (zum Beispiel "{detection}") nachschlagen, um zu sehen, dass es sich bei diesen Tools um einen dokumentierten Fehlalarm handelt.',
	'av.whatAllowDoesTitle': 'Was bewirkt "Im Antivirenprogramm zulassen"',
	'av.whatAllowDoesIntro':
		'Es fragt Windows nach Administratorrechten (eine Abfrage, auf Ja klicken) und führt dann den in Windows integrierten',
	'av.whatAllowDoesIntroAfter':
		'Befehl aus, um der Ausschlussliste von Windows Defender einige Einträge hinzuzufügen:',
	'av.exclusionFoldersBefore': 'Deinen',
	'av.gameFolder': 'Spielordner',
	'av.exclusionFoldersAnd': 'und den',
	'av.launcherFolder': 'Launcher-Ordner',
	'av.exclusionFoldersAfter':
		', damit die darin enthaltenen Mod-Dateien nicht mehr gescannt oder in Quarantäne verschoben werden.',
	'av.exclusionExesAnd': 'und',
	'av.exclusionExesAfter':
		'als erlaubte Prozesse, damit sie während der Ausführung nicht blockiert werden.',
	'av.whatAllowDoesOutro':
		'Das ist dasselbe, was du von Hand unter Windows-Sicherheit, Viren- und Bedrohungsschutz, Ausschlüsse tun würdest. Es installiert nichts, führt keine Drittanbietersoftware aus und ändert nichts außerhalb dieser bestimmten Pfade.',
	'av.back': 'Zurück',
	'addons.sectionInstalled': 'Installiert',
	'addons.sectionRecommended': 'Empfohlen',
	'addons.sectionAvailable': 'Verfügbar',
	'addons.checkForUpdates': 'Nach Updates suchen',
	'addons.addCustomGitAddon': 'Benutzerdefiniertes Git-Addon hinzufügen',
	'addons.updateAll': 'Alle aktualisieren',
	'addons.everythingUpToDate': 'Alles ist auf dem neuesten Stand.',
	'addons.installAddon': 'Addon installieren',
	'addons.previewAlt': 'Vorschau',
	'addons.readyToInstall': 'Bereit zur Installation',
	'addons.invalidGitUrl': 'Keine gültige Git-Repository-URL',
	'addons.install': 'Installieren',
	'addons.warnIncorrectVersionFull':
		'Dieses Addon scheint für eine andere Spielversion ({version}) erstellt worden zu sein und funktioniert möglicherweise nicht korrekt',
	'addons.warnIncorrectVersionShort': 'Falsche Version',
	'addons.warnMissingDependenciesFull':
		'Diesem Addon fehlen Abhängigkeiten: {deps}',
	'addons.warnMissingDependenciesShort': 'Fehlende Abhängigkeiten',
	'addons.details': 'Details',
	'addons.openOnGithub': '{url} auf GitHub öffnen',
	'addons.upToDate': 'Aktuell',
	'addons.notVersioned': 'Nicht versioniert',
	'addons.update': 'Aktualisieren',
	'addons.ownCopy': 'Eigene Kopie',
	'addons.ownCopyHint':
		'Diese Kopie von {name} wurde nicht vom Launcher installiert und gehört dir. Der Launcher behält sie und aktualisiert sie nicht.',
	'addons.useLauncherVersion': 'Launcher-Version verwenden',
	'addons.useLauncherVersionHint':
		'Installiert die Launcher-Version dieses Addons. Deine Kopie wird ersetzt und nicht aufbewahrt.',
	'addons.edited': 'Bearbeitet',
	'addons.editedHint':
		'Du hast Dateien in diesem Addon geändert. Beim Aktualisieren werden deine Änderungen überschrieben.',
	'addons.download': 'Herunterladen',
	'addons.deleteConfirmTitle': 'Bist du sicher?',
	'addons.deleteConfirmBody':
		'Möchtest du das Addon {folder} wirklich löschen?',
	'addons.deleteConfirmFiles':
		'Dadurch werden alle Dateien im Addon-Ordner gelöscht.',
	'addons.delete': 'Löschen',
	'addons.remove': 'Entfernen',
	'addons.detailSource': 'Quelle',
	'addons.openOnGithubShort': 'Auf GitHub öffnen',
	'addons.detailContributions': 'Beiträge',
	'addons.detailAddonVersion': 'Addon-Version',
	'addons.detailDependencies': 'Abhängigkeiten',
	'addons.optional': '(optional)',
	'prefs.mirrorOffline': 'offline',
	'prefs.mirrorChecking': 'wird geprüft…',
	'prefs.mirrorOnline': 'online',
	'prefs.title': 'EINSTELLUNGEN',
	'prefs.installLocation': 'INSTALLATIONSORT:',
	'prefs.openFolder': 'Ordner öffnen',
	'prefs.notSelected': 'Nicht ausgewählt',
	'prefs.change': 'Ändern',
	'prefs.downloadMirror': 'DOWNLOAD-MIRROR:',
	'prefs.recheck': 'Erneut prüfen',
	'prefs.troubleshooting': 'FEHLERBEHEBUNG:',
	'prefs.verifyGameFiles': 'Spieldateien überprüfen',
	'prefs.openLogFile': 'Protokolldatei öffnen',
	'prefs.allowThroughAntivirus': 'Im Antivirenprogramm zulassen',
	'prefs.exclusionAdded':
		'Hinzugefügt. Überprüfe die Spieldateien erneut, falls welche entfernt wurden.',
	'prefs.generalSettings': 'ALLGEMEINE EINSTELLUNGEN:',
	'prefs.cleanWdb': 'WDB bei jedem Start leeren',
	'prefs.minimizeToTray': 'Während des Spielens in den Infobereich minimieren',
	'prefs.proton': 'PROTON:',
	'prefs.useProton': 'Spiel mit Proton starten',
	'prefs.protonVersion': 'Proton-Version',
	'prefs.protonNone':
		'Kein Proton gefunden. Installiere Proton über Steam oder lege GE-Proton in den Steam-Ordner compatibilitytools.d.',
	'launch.protonMissing':
		'Die in den Einstellungen gewählte Proton-Version wurde nicht gefunden. Wähle eine andere oder schalte Proton aus und klicke dann erneut auf „Spielen“.',
	'prefs.save': 'Speichern',
	'prefs.installLocationTitle': 'Installationsort',
	'prefs.portableInfo':
		'Du verwendest die portable Version des Launchers. Der Installationsort wird durch den Speicherort der ausführbaren Launcher-Datei bestimmt.',
	'prefs.errorLabel': 'Fehler: ',
	'prefs.wowExeNotFound':
		'{exe} wurde im aktuellen Ordner nicht gefunden. Bitte schließe den Launcher und verschiebe ihn in dein WoW-1.12-Client-Verzeichnis.',
	'prefs.selectDirectory':
		'Wähle ein Verzeichnis für die Installation des Spielclients aus.',
	'prefs.upgradeExisting':
		'Du kannst auch ein Verzeichnis mit einer vorhandenen Turtle-WoW- oder Vanilla-WoW-Installation wählen, und es wird automatisch aktualisiert.',
	'prefs.installDirectory': 'Installationsverzeichnis:',
	'prefs.noClientHere':
		'In diesem Ordner ist keine {exe}. Der Launcher lädt hier einen neuen Client herunter, der deine vorhandenen Addons und Einstellungen nicht enthält. Wenn du bereits eine Installation hast, wähle stattdessen deren Ordner.',
	'prefs.noClientHereConfirm':
		'Verstanden — einen neuen Client in diesen Ordner herunterladen',
	'prefs.confirm': 'Bestätigen',
	'misc.newsTitle': 'Neuigkeiten',
	'misc.newsByAuthor': 'von {author}',
	'misc.newsReadMore': 'Mehr lesen',
	'misc.refresh': 'Aktualisieren',
	'misc.newsLoading': 'Neuigkeiten werden geladen...',
	'misc.newsError': 'Der Neuigkeiten-Feed konnte nicht erreicht werden.',
	'misc.newsEmpty': 'Noch keine Neuigkeiten – schau später wieder vorbei.',
	'misc.tryAgain': 'Erneut versuchen',
	'misc.comingSoon': 'Demnächst verfügbar...',
	'misc.selfUpdateCheckFailed': 'Update-Prüfung fehlgeschlagen',
	'misc.selfUpdateAvailable':
		'Launcher-Update {version} verfügbar – Download wird vorbereitet…',
	'misc.selfUpdateDownloading':
		'Update {version} wird heruntergeladen · {percent}%',
	'misc.selfUpdateReady': 'Launcher-Update {version} bereit zur Installation',
	'misc.selfUpdateInstallNow': 'Jetzt installieren',
	'misc.tabCrashed': '{tab} ist abgestürzt',
	'misc.somethingWentWrong': 'Etwas ist schiefgelaufen!',
	'misc.uncaughtError': 'Nicht abgefangener {name}: {message}',
	'misc.unknownError': 'Unbekannter Fehler',
	'misc.copyError': 'Fehler kopieren',
	'misc.reload': 'Neu laden'
};

const zhCN: Dict = {
	'tab.news': '新闻',
	'tab.tweaks': '优化',
	'tab.addons': '插件',
	'tab.mods': '模组',
	'topbar.settings': '设置',
	'topbar.minimize': '最小化',
	'topbar.maximize': '最大化',
	'topbar.restore': '还原',
	'topbar.quit': '退出',
	'topbar.language': '语言',
	'quit.title': '退出？',
	'quit.warn': '游戏正在更新。现在退出可能会导致问题。',
	'quit.return': '返回',
	'launch.verifying': '正在验证',
	'launch.play': '开始游戏',
	'launch.retry': '重试',
	'launch.install': '安装',
	'launch.update': '更新',
	'launch.updating': '正在更新',
	'launch.cancel': '取消',
	'update.cancelled': '下载已停止。点击更新即可从中断处继续。',
	'update.stalled': '下载没有进展，已停止。点击重试再试一次。',
	'update.diskFullSize':
		'磁盘空间不足：下载还需要游戏所在磁盘约 {size} 的空间。请释放空间后点击重试。',
	'update.diskFull': '游戏所在磁盘的可用空间不足。请释放一些空间后点击重试。',
	'update.network': '无法连接到下载服务器。请检查网络连接后点击重试。',
	'update.fileAccess':
		'无法写入游戏文件。请关闭游戏以及正在使用游戏文件夹的程序，检查杀毒软件后点击重试。',
	'update.downloaderMissing':
		'下载程序（aria2c.exe）缺失，很可能已被杀毒软件删除。请从隔离区恢复或重新安装启动器，然后点击重试。',
	'launch.applying': '正在应用',
	'launch.updateAvailable': '有可用更新！',
	'launch.modsChanged': '模组已更改，请在游戏前应用',
	'launch.upToDate': '一切都是最新的！',
	'launch.version': '版本：{version}',
	'launch.errorLabel': '错误：',
	'launch.serverFail': '无法连接到更新服务器',
	'launch.localVersion': '您可以启动本地版本 {version}',
	'launch.tryLater': '请稍后再试',
	'launch.verifyHint': '点击重试以验证游戏数据。',
	'launch.remaining': '剩余',
	'launch.calculating': '计算中…',
	'launch.onDisk': '在磁盘上',
	'launch.blockedByAntivirus':
		'杀毒软件阻止了游戏启动。请将游戏文件夹添加为例外（设置中的“在杀毒软件中放行”），然后再次点击开始游戏。',
	'launch.updateFirst':
		'启动器打开期间发布了游戏更新。请等待启动器完成检查和更新，然后点击开始游戏。',
	'tweaks.raidVisuals.label': '团队副本视觉增强',
	'tweaks.raidVisuals.text':
		'可选下载（约 9 MB）。为团队首领技能添加更清晰的地面标记和音效，并自动与服务器保持同步。（又称 Patch-O）',
	'tweaks.alwaysAutoLoot.label': '始终自动拾取',
	'tweaks.alwaysAutoLoot.text':
		'反转自动拾取行为，改为始终自动拾取，并禁用按住绑定键的自动拾取。',
	'tweaks.largeAddress.label': '大地址感知',
	'tweaks.largeAddress.text': '允许游戏使用超过 2GB 的内存。',
	'tweaks.nameplateRange.label': '姓名板范围',
	'tweaks.nameplateRange.text':
		'增加姓名板可见的距离。[Vanilla: 20] [Classic: 41]',
	'tweaks.cameraHeading': '镜头',
	'tweaks.fieldOfView.label': '视野范围',
	'tweaks.fieldOfView.text':
		'推荐用于宽屏窗口分辨率。[Vanilla: 90] [Tweaks: 110]',
	'tweaks.farClip.label': '渲染距离',
	'tweaks.farClip.text':
		'增加最大渲染距离。数值过高可能导致进入游戏世界时崩溃。[Vanilla: 777]',
	'tweaks.farClip.recommendedHint': '为您的电脑推荐：{value}。',
	'tweaks.frillDistance.label': '地表杂物距离',
	'tweaks.frillDistance.text':
		'更改地表杂物的渲染距离。[Vanilla: 70] [Tweaks: 300]',
	'tweaks.cameraDistance.label': '镜头距离',
	'tweaks.cameraDistance.text':
		'增加最大镜头（拉远）距离。[Vanilla: 50] [Max:100]',
	'tweaks.soundsHeading': '声音',
	'tweaks.soundInBackground.label': '后台声音',
	'tweaks.soundInBackground.text': '允许游戏在最小化时继续播放声音。',
	'tweaks.applyFailed': '应用优化失败：{message}',
	'tweaks.highlighted': '已高亮',
	'tweaks.recommendedNote': '选项为推荐项，默认已启用',
	'tweaks.reset': '重置',
	'tweaks.apply': '应用',
	'mods.update': '更新',
	'mods.ignoreUpdates': '忽略更新',
	'mods.ownFile': '你自己的文件',
	'mods.ownFileHint':
		'你用自己的副本替换了 {files}。无论是否勾选此 Mod，启动器都会保留它，不做任何改动。',
	'mods.useLauncherVersion': '使用启动器版本',
	'mods.useLauncherVersionHint':
		'恢复启动器自带的 {files}。你的副本会被替换，不会保留。',
	'mods.title': '自定义 Mods',
	'mods.unsavedChanges': '未保存的更改',
	'mods.warning':
		'启用自定义 Mods 不一定能带来性能提升，甚至可能因系统差异导致游戏崩溃。如遇到任何问题，请尝试将其禁用。',
	'mods.enableRequired': '启用 {mods}，你所选的 Mods 需要它们。',
	'mods.depRequired': '必须启用 {mod}，它是 {requiredBy} 所必需的。',
	'mods.highlighted': '已高亮',
	'mods.highlightedRecommended': 'Mods 为推荐项。',
	'mods.apply': '应用',
	'mods.cantApplyYet': '暂时无法应用',
	'mods.close': '关闭',
	'av.blockedTitle': '被杀毒软件拦截',
	'av.blockedOne': 'Windows Defender 拦截了此 Mod：',
	'av.blockedMany': 'Windows Defender 拦截了以下 Mods：',
	'av.blockedExplain':
		'这些是安全的社区 Mods，被 Defender 误报了。允许它们一次，然后重试即可。',
	'av.whyHappening': '为什么会这样？',
	'av.allowThrough': '在杀毒软件中放行',
	'av.addedRetry': '已添加。关闭此窗口并重试。',
	'av.close': '关闭',
	'av.whyTitle': '为什么杀毒软件会标记 Mods',
	'av.whyIntro':
		'启动器安装的部分 Mods 会被 Windows Defender（或其他杀毒软件）标记为威胁，例如“{detection}”。这是一个',
	'av.falsePositive': '误报',
	'av.whatSetsItOff': '触发原因',
	'av.whatSetsItOffIntro':
		'这些 Mods 使用了两种会让杀毒软件启发式检测觉得可疑的技术，来对这款有 20 年历史的 1.12 游戏客户端进行现代化改造：',
	'av.dllInjection': 'DLL 注入',
	'av.dllInjectionText':
		'这些 Mods 会向运行中的游戏加载额外代码以添加功能（延迟补偿、更好的姓名板、性能优化）。向其他程序注入代码也是恶意软件会做的事，因此仅凭这一行为就会触发扫描器。',
	'av.exePatching': '可执行文件修补',
	'av.exePatchingText':
		'部分 Mods 会修改 WoW.exe 以解除旧引擎的限制（例如让 32 位客户端可使用 4GB 内存而非 2GB）。修改可执行文件是另一种类似恶意软件的特征。',
	'av.heuristicNote':
		'由于这些是基于行为的（启发式）检测，而非与真实恶意软件的特征匹配，因此使用这些技术的正规 Mods 会被误报为通用的“木马”或“黑客工具”。',
	'av.whatModsDo': '这些 Mods 实际做了什么',
	'av.modVanillaFixes': '用于修复卡顿和计时器错误并启动其他 Mods 的加载器。',
	'av.modNampower': '延迟补偿，让你在较高延迟下施法依然跟手。',
	'av.modSuperWowUnitXp': '高级 Lua、真正的姓名板、镜头与目标选取的增强。',
	'av.modDxvk': '将旧的 DirectX 9 转换为现代的 Vulkan，大幅提升 FPS。',
	'av.howToVerify': '如何核实这些说法',
	'av.howToVerifyText':
		'这些都是开源的社区项目。你可以通过 Mods 列表中每个 Mod 旁的源代码链接阅读其每一行代码，也可以查询检测名称（例如“{detection}”），即可确认它在这些工具上是已被记录的误报。',
	'av.whatAllowDoesTitle': '“在杀毒软件中放行”会做什么',
	'av.whatAllowDoesIntro':
		'它会向 Windows 请求管理员权限（仅一次提示，点击“是”），然后运行 Windows 自带的',
	'av.whatAllowDoesIntroAfter':
		'命令，向 Windows Defender 排除列表添加几个条目：',
	'av.exclusionFoldersBefore': '你的',
	'av.gameFolder': '游戏文件夹',
	'av.exclusionFoldersAnd': '以及',
	'av.launcherFolder': '启动器文件夹',
	'av.exclusionFoldersAfter': '，这样其中的 Mod 文件就不会再被扫描或隔离。',
	'av.exclusionExesAnd': '和',
	'av.exclusionExesAfter': '作为允许的进程，使它们在运行时不会被拦截。',
	'av.whatAllowDoesOutro':
		'这与你在“Windows 安全中心 → 病毒和威胁防护 → 排除项”中手动操作的效果完全相同。它不安装任何东西，不运行任何第三方软件，也不会更改这些特定路径以外的任何内容。',
	'av.back': '返回',
	'addons.sectionInstalled': '已安装',
	'addons.sectionRecommended': '推荐',
	'addons.sectionAvailable': '可用',
	'addons.checkForUpdates': '检查更新',
	'addons.addCustomGitAddon': '添加自定义 git 插件',
	'addons.updateAll': '全部更新',
	'addons.everythingUpToDate': '一切均为最新。',
	'addons.installAddon': '安装插件',
	'addons.previewAlt': '预览',
	'addons.readyToInstall': '准备安装',
	'addons.invalidGitUrl': '不是有效的 git 仓库地址',
	'addons.install': '安装',
	'addons.warnIncorrectVersionFull':
		'此插件似乎是为其他游戏版本（{version}）制作的，可能无法正常运行',
	'addons.warnIncorrectVersionShort': '版本不符',
	'addons.warnMissingDependenciesFull': '此插件缺少依赖项：{deps}',
	'addons.warnMissingDependenciesShort': '缺少依赖项',
	'addons.details': '详情',
	'addons.openOnGithub': '在 GitHub 上打开 {url}',
	'addons.upToDate': '已是最新',
	'addons.notVersioned': '无版本信息',
	'addons.update': '更新',
	'addons.ownCopy': '你自己的副本',
	'addons.ownCopyHint':
		'这份 {name} 不是启动器安装的，属于你自己。启动器会保留它，不会更新它。',
	'addons.useLauncherVersion': '使用启动器版本',
	'addons.useLauncherVersionHint':
		'安装启动器版本的此插件。你的副本会被替换，不会保留。',
	'addons.edited': '已修改',
	'addons.editedHint': '你修改过此插件中的文件。更新时会覆盖你的修改。',
	'addons.download': '下载',
	'addons.deleteConfirmTitle': '确定吗？',
	'addons.deleteConfirmBody': '确定要删除 {folder} 插件吗？',
	'addons.deleteConfirmFiles': '这将删除该插件文件夹中的所有文件。',
	'addons.delete': '删除',
	'addons.remove': '移除',
	'addons.detailSource': '源代码',
	'addons.openOnGithubShort': '在 GitHub 上打开',
	'addons.detailContributions': '贡献者',
	'addons.detailAddonVersion': '插件版本',
	'addons.detailDependencies': '依赖项',
	'addons.optional': '（可选）',
	'prefs.mirrorOffline': '离线',
	'prefs.mirrorChecking': '检查中…',
	'prefs.mirrorOnline': '在线',
	'prefs.title': '设置',
	'prefs.installLocation': '安装位置：',
	'prefs.openFolder': '打开文件夹',
	'prefs.notSelected': '未选择',
	'prefs.change': '更改',
	'prefs.downloadMirror': '下载镜像：',
	'prefs.recheck': '重新检查',
	'prefs.troubleshooting': '故障排除：',
	'prefs.verifyGameFiles': '校验游戏文件',
	'prefs.openLogFile': '打开日志文件',
	'prefs.allowThroughAntivirus': '在杀毒软件中放行',
	'prefs.exclusionAdded': '已添加。如有文件被删除，请重新校验游戏文件。',
	'prefs.generalSettings': '常规设置：',
	'prefs.cleanWdb': '每次启动时清理 WDB',
	'prefs.minimizeToTray': '游戏时最小化到托盘',
	'prefs.proton': 'PROTON：',
	'prefs.useProton': '使用 Proton 启动游戏',
	'prefs.protonVersion': 'Proton 版本',
	'prefs.protonNone':
		'未找到 Proton。请在 Steam 中安装 Proton，或将 GE-Proton 放入 Steam 的 compatibilitytools.d 文件夹。',
	'launch.protonMissing': '未找到设置中选择的 Proton 版本。请选择其他版本或关闭 Proton，然后再次点击开始游戏。',
	'prefs.save': '保存',
	'prefs.installLocationTitle': '安装位置',
	'prefs.portableInfo':
		'你正在使用便携版启动器。安装位置由启动器可执行文件所在的位置决定。',
	'prefs.errorLabel': '错误：',
	'prefs.wowExeNotFound':
		'在当前文件夹中未找到 {exe}。请关闭启动器并将其移动到你的 WoW 1.12 客户端目录。',
	'prefs.selectDirectory': '请选择游戏客户端的安装目录。',
	'prefs.upgradeExisting':
		'你也可以选择一个已有 Turtle WoW 或 Vanilla WoW 安装的目录，它将被自动升级。',
	'prefs.installDirectory': '安装目录：',
	'prefs.noClientHere':
		'此文件夹中没有 {exe}。启动器将在此处下载全新的客户端，其中不会包含你现有的插件和设置。如果你已经安装过，请改为选择原有的安装目录。',
	'prefs.noClientHereConfirm': '我已了解——在此文件夹下载全新客户端',
	'prefs.confirm': '确认',
	'misc.newsTitle': '新闻',
	'misc.newsByAuthor': '作者：{author}',
	'misc.newsReadMore': '阅读更多',
	'misc.refresh': '刷新',
	'misc.newsLoading': '正在加载新闻...',
	'misc.newsError': '无法连接到新闻源。',
	'misc.newsEmpty': '暂无新闻，请稍后再来查看。',
	'misc.tryAgain': '重试',
	'misc.comingSoon': '敬请期待...',
	'misc.selfUpdateCheckFailed': '检查更新失败',
	'misc.selfUpdateAvailable': '启动器更新 {version} 可用，正在准备下载…',
	'misc.selfUpdateDownloading': '正在下载更新 {version} · {percent}%',
	'misc.selfUpdateReady': '启动器更新 {version} 已准备好安装',
	'misc.selfUpdateInstallNow': '立即安装',
	'misc.tabCrashed': '{tab} 已崩溃',
	'misc.somethingWentWrong': '出错了！',
	'misc.uncaughtError': '未捕获的 {name}：{message}',
	'misc.unknownError': '未知错误',
	'misc.copyError': '复制错误信息',
	'misc.reload': '重新加载'
};

const esES: Dict = {
	'tab.news': 'Noticias',
	'tab.tweaks': 'Ajustes',
	'tab.addons': 'Addons',
	'tab.mods': 'Mods',
	'topbar.settings': 'Configuración',
	'topbar.minimize': 'Minimizar',
	'topbar.maximize': 'Maximizar',
	'topbar.restore': 'Restaurar',
	'topbar.quit': 'Salir',
	'topbar.language': 'Idioma',
	'quit.title': '¿Salir?',
	'quit.warn':
		'Tu juego se está actualizando. Salir ahora puede causar problemas.',
	'quit.return': 'Volver',
	'launch.verifying': 'Verificando',
	'launch.play': 'Jugar',
	'launch.retry': 'Reintentar',
	'launch.install': 'Instalar',
	'launch.update': 'Actualizar',
	'launch.updating': 'Actualizando',
	'launch.cancel': 'Cancelar',
	'update.cancelled':
		'Descarga detenida. Pulsa Actualizar para continuar donde se quedó.',
	'update.stalled':
		'La descarga dejó de avanzar. Pulsa Reintentar para volver a intentarlo.',
	'update.diskFullSize':
		'No hay suficiente espacio libre: la descarga necesita unos {size} más en la unidad del juego. Libera espacio y pulsa Reintentar.',
	'update.diskFull':
		'No hay suficiente espacio libre en la unidad del juego. Libera algo de espacio y pulsa Reintentar.',
	'update.network':
		'No se pudo contactar con los servidores de descarga. Comprueba tu conexión y pulsa Reintentar.',
	'update.fileAccess':
		'No se pudieron escribir los archivos del juego. Cierra el juego y cualquier programa que use su carpeta, revisa tu antivirus y pulsa Reintentar.',
	'update.downloaderMissing':
		'Falta el programa de descarga (aria2c.exe); probablemente lo eliminó tu antivirus. Restáuralo desde la cuarentena o reinstala el lanzador y pulsa Reintentar.',
	'launch.applying': 'Aplicando',
	'launch.updateAvailable': '¡Actualización disponible!',
	'launch.modsChanged': 'Mods cambiados, aplícalos antes de jugar',
	'launch.upToDate': '¡Todo está actualizado!',
	'launch.version': 'Versión: {version}',
	'launch.errorLabel': 'Error:',
	'launch.serverFail': 'No se pudo conectar al servidor de actualización',
	'launch.localVersion': 'Puedes iniciar la versión local {version}',
	'launch.tryLater': 'Inténtalo de nuevo más tarde',
	'launch.verifyHint': 'Verifica los datos del juego pulsando Reintentar.',
	'launch.remaining': 'restante',
	'launch.calculating': 'calculando…',
	'launch.onDisk': 'en disco',
	'launch.blockedByAntivirus':
		'Tu antivirus impidió que el juego se iniciara. Añade la carpeta del juego como excepción (Configuración, «Permitir a través del antivirus») y pulsa Jugar de nuevo.',
	'launch.updateFirst':
		'Salió una actualización del juego mientras el lanzador estaba abierto. Deja que el lanzador termine de comprobar y actualizar, y luego pulsa Jugar.',
	'tweaks.raidVisuals.label': 'Efectos de banda mejorados',
	'tweaks.raidVisuals.text':
		'Descarga opcional de ~9 MB. Añade marcadores de suelo y sonidos más claros para las habilidades de los jefes de banda, sincronizados automáticamente con el servidor. (también conocido como Patch-O)',
	'tweaks.alwaysAutoLoot.label': 'Saqueo automático siempre',
	'tweaks.alwaysAutoLoot.text':
		'Invierte el comportamiento del saqueo automático para saquear siempre de forma automática y desactivar el saqueo automático con tecla asignada.',
	'tweaks.largeAddress.label': 'Large Address Aware',
	'tweaks.largeAddress.text':
		'Permite que el juego utilice más de 2 GB de memoria.',
	'tweaks.nameplateRange.label': 'Alcance de las placas de nombre',
	'tweaks.nameplateRange.text':
		'Aumenta la distancia a la que son visibles las placas de nombre. [Vanilla: 20] [Classic: 41]',
	'tweaks.cameraHeading': 'Cámara',
	'tweaks.fieldOfView.label': 'Campo de visión',
	'tweaks.fieldOfView.text':
		'Recomendado para resoluciones de ventana panorámicas. [Vanilla: 90] [Tweaks: 110]',
	'tweaks.farClip.label': 'Distancia de renderizado',
	'tweaks.farClip.text':
		'Aumenta la distancia máxima de renderizado. Los valores muy altos pueden bloquear el juego al entrar al mundo. [Vanilla: 777]',
	'tweaks.farClip.recommendedHint': 'Recomendado para tu PC: {value}.',
	'tweaks.frillDistance.label': 'Distancia de la maleza',
	'tweaks.frillDistance.text':
		'Cambia la distancia de renderizado de la maleza del suelo. [Vanilla: 70] [Tweaks: 300]',
	'tweaks.cameraDistance.label': 'Distancia de la cámara',
	'tweaks.cameraDistance.text':
		'Aumenta la distancia máxima de la cámara (alejar el zoom). [Vanilla: 50] [Max:100]',
	'tweaks.soundsHeading': 'Sonidos',
	'tweaks.soundInBackground.label': 'Sonidos en segundo plano',
	'tweaks.soundInBackground.text':
		'Permite que el sonido del juego se reproduzca mientras está minimizado.',
	'tweaks.applyFailed': 'No se han podido aplicar los ajustes: {message}',
	'tweaks.highlighted': 'Destacado',
	'tweaks.recommendedNote':
		'opciones recomendadas y activadas de forma predeterminada',
	'tweaks.reset': 'Restablecer',
	'tweaks.apply': 'Aplicar',
	'mods.update': 'actualizar',
	'mods.ignoreUpdates': 'Ignorar actualizaciones',
	'mods.ownFile': 'Tu propio archivo',
	'mods.ownFileHint':
		'Reemplazaste {files} por tu propia copia. El lanzador la conserva y nunca la cambia, esté este mod marcado o no.',
	'mods.useLauncherVersion': 'Usar la versión del lanzador',
	'mods.useLauncherVersionHint':
		'Vuelve a poner {files} del lanzador. Tu copia se reemplaza y no se conserva.',
	'mods.title': 'MODS PERSONALIZADOS',
	'mods.unsavedChanges': 'cambios sin guardar',
	'mods.warning':
		'Activar los mods personalizados puede no aportar ninguna mejora de rendimiento o incluso provocar cierres inesperados del juego según tu sistema. Prueba a desactivarlos si experimentas algún problema.',
	'mods.enableRequired':
		'Activa {mods}, necesarios para los mods seleccionados.',
	'mods.depRequired':
		'{mod} debe estar activado. Es necesario para {requiredBy}.',
	'mods.highlighted': 'Destacado',
	'mods.highlightedRecommended': 'mods recomendados.',
	'mods.apply': 'Aplicar',
	'mods.cantApplyYet': 'AÚN NO SE PUEDE APLICAR',
	'mods.close': 'Cerrar',
	'av.blockedTitle': 'BLOQUEADO POR EL ANTIVIRUS',
	'av.blockedOne': 'Windows Defender ha bloqueado este mod:',
	'av.blockedMany': 'Windows Defender ha bloqueado estos mods:',
	'av.blockedExplain':
		'Son mods seguros de la comunidad que Defender marca por error. Permítelos una vez y vuelve a intentarlo.',
	'av.whyHappening': '¿Por qué ocurre esto?',
	'av.allowThrough': 'Permitir a través del antivirus',
	'av.addedRetry': 'Añadido. Cierra esta ventana y vuelve a intentarlo.',
	'av.close': 'Cerrar',
	'av.whyTitle': 'POR QUÉ EL ANTIVIRUS MARCA LOS MODS',
	'av.whyIntro':
		'Algunos de los mods que instala el launcher son marcados por Windows Defender (u otro antivirus) como una amenaza, por ejemplo «{detection}». Se trata de un',
	'av.falsePositive': 'falso positivo',
	'av.whatSetsItOff': 'Qué lo provoca',
	'av.whatSetsItOffIntro':
		'Estos mods modernizan el cliente del juego 1.12, de hace 20 años, mediante dos técnicas que resultan sospechosas para la heurística del antivirus:',
	'av.dllInjection': 'Inyección de DLL',
	'av.dllInjectionText':
		'los mods cargan código adicional en el juego en ejecución para añadir funciones (compensación de ping, mejores placas de nombre, rendimiento). Cargar código en otro programa es también algo que hace el malware, así que solo ese comportamiento ya activa el análisis.',
	'av.exePatching': 'Parcheo del ejecutable',
	'av.exePatchingText':
		'algunos mods editan WoW.exe para eliminar los límites del viejo motor (por ejemplo, permitir que el cliente de 32 bits use 4 GB de RAM en vez de 2 GB). Modificar un ejecutable es otro patrón propio del malware.',
	'av.heuristicNote':
		'Como son detecciones basadas en el comportamiento (heurísticas) y no coincidencias con malware real, los mods legítimos que las utilizan se detectan como falsos positivos genéricos de tipo «trojan» o «hacktool».',
	'av.whatModsDo': 'Qué hacen realmente los mods',
	'av.modVanillaFixes':
		'el cargador que corrige los tirones y los errores de temporización e inicia los demás mods.',
	'av.modNampower':
		'compensación de ping para que los lanzamientos respondan bien con latencias más altas.',
	'av.modSuperWowUnitXp':
		'Lua avanzado, placas de nombre reales y mejoras de cámara y selección de objetivos.',
	'av.modDxvk':
		'traduce el antiguo DirectX 9 al moderno Vulkan para obtener grandes mejoras de FPS.',
	'av.howToVerify': 'Cómo verificar estas afirmaciones',
	'av.howToVerifyText':
		'Son proyectos de código abierto de la comunidad. Puedes leer cada línea del código de cada mod desde el enlace al código fuente que aparece junto a él en la lista de Mods, y puedes buscar el nombre de la detección (por ejemplo «{detection}») para comprobar que es un falso positivo documentado en estas herramientas.',
	'av.whatAllowDoesTitle': 'Qué hace «Permitir a través del antivirus»',
	'av.whatAllowDoesIntro':
		'Pide permiso de administrador a Windows (un único aviso, haz clic en Sí) y luego ejecuta el propio comando integrado de Windows',
	'av.whatAllowDoesIntroAfter':
		'para añadir unas pocas entradas a la lista de exclusiones de Windows Defender:',
	'av.exclusionFoldersBefore': 'Tu',
	'av.gameFolder': 'carpeta del juego',
	'av.exclusionFoldersAnd': 'y la',
	'av.launcherFolder': 'carpeta del launcher',
	'av.exclusionFoldersAfter':
		', de modo que los archivos de los mods que contienen dejan de analizarse y de ponerse en cuarentena.',
	'av.exclusionExesAnd': 'y',
	'av.exclusionExesAfter':
		'como procesos permitidos, para que no se bloqueen durante su ejecución.',
	'av.whatAllowDoesOutro':
		'Es lo mismo que harías a mano en Seguridad de Windows, Protección antivirus y contra amenazas, Exclusiones. No instala nada, no ejecuta software de terceros y no cambia nada fuera de esas rutas concretas.',
	'av.back': 'Atrás',
	'addons.sectionInstalled': 'Instalados',
	'addons.sectionRecommended': 'Recomendados',
	'addons.sectionAvailable': 'Disponibles',
	'addons.checkForUpdates': 'Buscar actualizaciones',
	'addons.addCustomGitAddon': 'Añadir addon de git personalizado',
	'addons.updateAll': 'Actualizar todo',
	'addons.everythingUpToDate': 'Todo está actualizado.',
	'addons.installAddon': 'Instalar addon',
	'addons.previewAlt': 'Vista previa',
	'addons.readyToInstall': 'Listo para instalar',
	'addons.invalidGitUrl': 'No es una URL de repositorio git válida',
	'addons.install': 'Instalar',
	'addons.warnIncorrectVersionFull':
		'Este addon parece estar hecho para una versión distinta del juego ({version}) y puede que no funcione correctamente',
	'addons.warnIncorrectVersionShort': 'Versión incorrecta',
	'addons.warnMissingDependenciesFull':
		'A este addon le faltan dependencias: {deps}',
	'addons.warnMissingDependenciesShort': 'Faltan dependencias',
	'addons.details': 'Detalles',
	'addons.openOnGithub': 'Abrir {url} en GitHub',
	'addons.upToDate': 'Actualizado',
	'addons.notVersioned': 'Sin versión',
	'addons.update': 'Actualizar',
	'addons.ownCopy': 'Tu propia copia',
	'addons.ownCopyHint':
		'Esta copia de {name} no la instaló el lanzador, así que es tuya. El lanzador la conserva y no la actualiza.',
	'addons.useLauncherVersion': 'Usar la versión del lanzador',
	'addons.useLauncherVersionHint':
		'Instala la versión del lanzador de este addon. Tu copia se reemplaza y no se conserva.',
	'addons.edited': 'Editado',
	'addons.editedHint':
		'Cambiaste archivos de este addon. Al actualizarlo, se sobrescriben tus cambios.',
	'addons.download': 'Descargar',
	'addons.deleteConfirmTitle': '¿Estás seguro?',
	'addons.deleteConfirmBody': '¿Seguro que quieres eliminar el addon {folder}?',
	'addons.deleteConfirmFiles':
		'Esto eliminará todos los archivos de la carpeta del addon.',
	'addons.delete': 'Eliminar',
	'addons.remove': 'Quitar',
	'addons.detailSource': 'Código fuente',
	'addons.openOnGithubShort': 'Abrir en GitHub',
	'addons.detailContributions': 'Contribuciones',
	'addons.detailAddonVersion': 'Versión del addon',
	'addons.detailDependencies': 'Dependencias',
	'addons.optional': '(opcional)',
	'prefs.mirrorOffline': 'sin conexión',
	'prefs.mirrorChecking': 'comprobando…',
	'prefs.mirrorOnline': 'en línea',
	'prefs.title': 'AJUSTES',
	'prefs.installLocation': 'UBICACIÓN DE INSTALACIÓN:',
	'prefs.openFolder': 'Abrir carpeta',
	'prefs.notSelected': 'Sin seleccionar',
	'prefs.change': 'Cambiar',
	'prefs.downloadMirror': 'SERVIDOR DE DESCARGA:',
	'prefs.recheck': 'Volver a comprobar',
	'prefs.troubleshooting': 'SOLUCIÓN DE PROBLEMAS:',
	'prefs.verifyGameFiles': 'Verificar archivos del juego',
	'prefs.openLogFile': 'Abrir archivo de registro',
	'prefs.allowThroughAntivirus': 'Permitir a través del antivirus',
	'prefs.exclusionAdded':
		'Añadido. Vuelve a verificar los archivos del juego si se eliminó alguno.',
	'prefs.generalSettings': 'AJUSTES GENERALES:',
	'prefs.cleanWdb': 'Limpiar WDB en cada inicio',
	'prefs.minimizeToTray': 'Minimizar a la bandeja mientras juegas',
	'prefs.proton': 'PROTON:',
	'prefs.useProton': 'Iniciar el juego con Proton',
	'prefs.protonVersion': 'Versión de Proton',
	'prefs.protonNone':
		'No se encontró Proton. Instala Proton en Steam o coloca GE-Proton en la carpeta compatibilitytools.d de Steam.',
	'launch.protonMissing':
		'No se encontró la versión de Proton elegida en Configuración. Elige otra o desactiva Proton y pulsa Jugar de nuevo.',
	'prefs.save': 'Guardar',
	'prefs.installLocationTitle': 'Ubicación de instalación',
	'prefs.portableInfo':
		'Estás usando la versión portátil del launcher. La ubicación de instalación viene determinada por la ubicación del ejecutable del launcher.',
	'prefs.errorLabel': 'Error: ',
	'prefs.wowExeNotFound':
		'No se ha encontrado {exe} en la carpeta actual. Cierra el launcher y muévelo al directorio de tu cliente de WoW 1.12.',
	'prefs.selectDirectory':
		'Selecciona un directorio para la instalación del cliente del juego.',
	'prefs.upgradeExisting':
		'También puedes elegir un directorio con una instalación existente de Turtle WoW o Vanilla WoW, y se actualizará automáticamente.',
	'prefs.installDirectory': 'Directorio de instalación:',
	'prefs.noClientHere':
		'No hay ningún {exe} en esta carpeta. El launcher descargará aquí un cliente nuevo, que no incluirá tus addons ni tu configuración actuales. Si ya tienes una instalación, elige esa carpeta.',
	'prefs.noClientHereConfirm':
		'Lo entiendo: descargar un cliente nuevo en esta carpeta',
	'prefs.confirm': 'Confirmar',
	'misc.newsTitle': 'Noticias',
	'misc.newsByAuthor': 'por {author}',
	'misc.newsReadMore': 'Leer más',
	'misc.refresh': 'Actualizar',
	'misc.newsLoading': 'Cargando noticias...',
	'misc.newsError': 'No se ha podido acceder al feed de noticias.',
	'misc.newsEmpty': 'Aún no hay noticias. Vuelve más tarde.',
	'misc.tryAgain': 'Reintentar',
	'misc.comingSoon': 'Próximamente...',
	'misc.selfUpdateCheckFailed': 'Error al buscar actualizaciones',
	'misc.selfUpdateAvailable':
		'Actualización del launcher {version} disponible. Preparando la descarga…',
	'misc.selfUpdateDownloading':
		'Descargando la actualización {version} · {percent}%',
	'misc.selfUpdateReady':
		'Actualización del launcher {version} lista para instalar',
	'misc.selfUpdateInstallNow': 'Instalar ahora',
	'misc.tabCrashed': '{tab} ha fallado',
	'misc.somethingWentWrong': '¡Algo ha salido mal!',
	'misc.uncaughtError': '{name} no capturado: {message}',
	'misc.unknownError': 'Error desconocido',
	'misc.copyError': 'Copiar error',
	'misc.reload': 'Recargar'
};

const ptBR: Dict = {
	'tab.news': 'Notícias',
	'tab.tweaks': 'Ajustes',
	'tab.addons': 'Addons',
	'tab.mods': 'Mods',
	'topbar.settings': 'Configurações',
	'topbar.minimize': 'Minimizar',
	'topbar.maximize': 'Maximizar',
	'topbar.restore': 'Restaurar',
	'topbar.quit': 'Sair',
	'topbar.language': 'Idioma',
	'quit.title': 'Sair?',
	'quit.warn':
		'Seu jogo está sendo atualizado. Sair agora pode causar problemas.',
	'quit.return': 'Voltar',
	'launch.verifying': 'Verificando',
	'launch.play': 'Jogar',
	'launch.retry': 'Tentar de novo',
	'launch.install': 'Instalar',
	'launch.update': 'Atualizar',
	'launch.updating': 'Atualizando',
	'launch.cancel': 'Cancelar',
	'update.cancelled':
		'Download interrompido. Clique em Atualizar para continuar de onde parou.',
	'update.stalled':
		'O download parou de avançar. Clique em Tentar de novo para tentar outra vez.',
	'update.diskFullSize':
		'Espaço livre insuficiente: o download precisa de cerca de {size} a mais na unidade do jogo. Libere espaço e clique em Tentar de novo.',
	'update.diskFull':
		'Espaço livre insuficiente na unidade do jogo. Libere algum espaço e clique em Tentar de novo.',
	'update.network':
		'Não foi possível acessar os servidores de download. Verifique sua conexão e clique em Tentar de novo.',
	'update.fileAccess':
		'Não foi possível gravar os arquivos do jogo. Feche o jogo e qualquer programa que use a pasta dele, verifique seu antivírus e clique em Tentar de novo.',
	'update.downloaderMissing':
		'O programa de download (aria2c.exe) está faltando, provavelmente removido pelo seu antivírus. Restaure-o da quarentena ou reinstale o lançador e clique em Tentar de novo.',
	'launch.applying': 'Aplicando',
	'launch.updateAvailable': 'Atualização disponível!',
	'launch.modsChanged': 'Mods alterados, aplique antes de jogar',
	'launch.upToDate': 'Tudo atualizado!',
	'launch.version': 'Versão: {version}',
	'launch.errorLabel': 'Erro:',
	'launch.serverFail': 'Falha ao conectar ao servidor de atualização',
	'launch.localVersion': 'Você pode iniciar a versão local {version}',
	'launch.tryLater': 'Tente novamente mais tarde',
	'launch.verifyHint': 'Verifique os dados do jogo clicando em Tentar de novo.',
	'launch.remaining': 'restante',
	'launch.calculating': 'calculando…',
	'launch.onDisk': 'no disco',
	'launch.blockedByAntivirus':
		'Seu antivírus impediu que o jogo iniciasse. Adicione a pasta do jogo como exceção (Configurações, "Permitir no antivírus") e clique em Jogar novamente.',
	'launch.updateFirst':
		'Saiu uma atualização do jogo enquanto o lançador estava aberto. Deixe o lançador terminar de verificar e atualizar e depois clique em Jogar.',
	'tweaks.raidVisuals.label': 'Efeitos de raide atualizados',
	'tweaks.raidVisuals.text':
		'Download opcional de ~9 MB. Adiciona marcações de chão e sons mais claros para as habilidades dos chefes de raide, mantidos em sincronia com o servidor automaticamente. (também conhecido como Patch-O)',
	'tweaks.alwaysAutoLoot.label': 'Saque automático sempre ativo',
	'tweaks.alwaysAutoLoot.text':
		'Inverte o comportamento do saque automático para saquear sempre automaticamente e desativa o saque automático com a tecla atribuída.',
	'tweaks.largeAddress.label': 'Large Address Aware',
	'tweaks.largeAddress.text': 'Permite que o jogo use mais de 2GB de memória.',
	'tweaks.nameplateRange.label': 'Alcance das placas de nome',
	'tweaks.nameplateRange.text':
		'Aumenta a distância em que as placas de nome ficam visíveis. [Vanilla: 20] [Classic: 41]',
	'tweaks.cameraHeading': 'Câmera',
	'tweaks.fieldOfView.label': 'Campo de visão',
	'tweaks.fieldOfView.text':
		'Recomendado para resoluções de janela widescreen. [Vanilla: 90] [Tweaks: 110]',
	'tweaks.farClip.label': 'Distância de renderização',
	'tweaks.farClip.text':
		'Aumenta a distância máxima de renderização. Valores muito altos podem travar o jogo ao entrar no mundo. [Vanilla: 777]',
	'tweaks.farClip.recommendedHint': 'Recomendado para o seu PC: {value}.',
	'tweaks.frillDistance.label': 'Distância da vegetação do solo',
	'tweaks.frillDistance.text':
		'Altera a distância de renderização da vegetação do solo. [Vanilla: 70] [Tweaks: 300]',
	'tweaks.cameraDistance.label': 'Distância da câmera',
	'tweaks.cameraDistance.text':
		'Aumenta a distância máxima da câmera (zoom para fora). [Vanilla: 50] [Max:100]',
	'tweaks.soundsHeading': 'Sons',
	'tweaks.soundInBackground.label': 'Sons em segundo plano',
	'tweaks.soundInBackground.text':
		'Permite que os sons do jogo continuem tocando enquanto o jogo está minimizado.',
	'tweaks.applyFailed': 'Falha ao aplicar os ajustes: {message}',
	'tweaks.highlighted': 'Destacadas',
	'tweaks.recommendedNote': 'opções são recomendadas e ativadas por padrão',
	'tweaks.reset': 'Redefinir',
	'tweaks.apply': 'Aplicar',
	'mods.update': 'atualizar',
	'mods.ignoreUpdates': 'Ignorar atualizações',
	'mods.ownFile': 'Seu próprio arquivo',
	'mods.ownFileHint':
		'Você substituiu {files} pela sua própria cópia. O lançador a mantém e nunca a altera, com este mod marcado ou não.',
	'mods.useLauncherVersion': 'Usar a versão do lançador',
	'mods.useLauncherVersionHint':
		'Coloca de volta {files} do lançador. Sua cópia é substituída e não é mantida.',
	'mods.title': 'MODS PERSONALIZADOS',
	'mods.unsavedChanges': 'alterações não salvas',
	'mods.warning':
		'Ativar mods personalizados pode não trazer nenhum ganho de desempenho ou até causar travamentos no jogo, dependendo do seu sistema. Tente desativá-los caso enfrente algum problema.',
	'mods.enableRequired':
		'Ative {mods}, exigidos pelos mods que você selecionou.',
	'mods.depRequired':
		'{mod} precisa estar ativado. Ele é exigido por {requiredBy}.',
	'mods.highlighted': 'Destacados',
	'mods.highlightedRecommended': 'mods são recomendados.',
	'mods.apply': 'Aplicar',
	'mods.cantApplyYet': 'AINDA NÃO É POSSÍVEL APLICAR',
	'mods.close': 'Fechar',
	'av.blockedTitle': 'BLOQUEADO PELO ANTIVÍRUS',
	'av.blockedOne': 'O Windows Defender bloqueou este mod:',
	'av.blockedMany': 'O Windows Defender bloqueou estes mods:',
	'av.blockedExplain':
		'Estes são mods seguros da comunidade que o Defender sinaliza por engano. Permita-os uma vez e tente novamente.',
	'av.whyHappening': 'Por que isso está acontecendo?',
	'av.allowThrough': 'Permitir no antivírus',
	'av.addedRetry': 'Adicionado. Feche isto e tente novamente.',
	'av.close': 'Fechar',
	'av.whyTitle': 'POR QUE O ANTIVÍRUS SINALIZA OS MODS',
	'av.whyIntro':
		'Alguns dos mods que o launcher instala são sinalizados pelo Windows Defender (ou outro antivírus) como uma ameaça, por exemplo "{detection}". Isso é um',
	'av.falsePositive': 'falso positivo',
	'av.whatSetsItOff': 'O que dispara o alerta',
	'av.whatSetsItOffIntro':
		'Estes mods modernizam o cliente do jogo 1.12, que tem 20 anos, usando duas técnicas que parecem suspeitas para as heurísticas de antivírus:',
	'av.dllInjection': 'Injeção de DLL',
	'av.dllInjectionText':
		'os mods carregam código extra no jogo em execução para adicionar recursos (compensação de ping, melhores placas de nome, desempenho). Carregar código em outro programa também é algo que malwares fazem, então só esse comportamento já aciona o scanner.',
	'av.exePatching': 'Modificação de executável',
	'av.exePatchingText':
		'alguns mods editam o WoW.exe para remover limites antigos do motor (por exemplo, permitir que o cliente de 32 bits use 4GB de RAM em vez de 2GB). Modificar um executável é outro padrão típico de malware.',
	'av.heuristicNote':
		'Como são detecções baseadas em comportamento (heurísticas), e não correspondências com malware real, mods legítimos que usam essas técnicas acabam sendo pegos como falsos positivos genéricos de "trojan" ou "hacktool".',
	'av.whatModsDo': 'O que os mods realmente fazem',
	'av.modVanillaFixes':
		'o carregador que corrige travamentos e bugs de timer e inicia os outros mods.',
	'av.modNampower':
		'compensação de ping para que as conjurações fiquem responsivas em latências mais altas.',
	'av.modSuperWowUnitXp':
		'Lua avançado, placas de nome reais e melhorias de câmera e seleção de alvo.',
	'av.modDxvk':
		'traduz o antigo DirectX 9 para o moderno Vulkan, com grandes ganhos de FPS.',
	'av.howToVerify': 'Como verificar essas afirmações',
	'av.howToVerifyText':
		'Estes são projetos de código aberto da comunidade. Você pode ler cada linha do código de cada mod pelo link da fonte ao lado dele na lista de Mods, e pode pesquisar o nome da detecção (por exemplo "{detection}") para ver que é um falso positivo documentado nessas ferramentas.',
	'av.whatAllowDoesTitle': 'O que faz a opção "Permitir no antivírus"',
	'av.whatAllowDoesIntro':
		'Ela pede permissão de administrador ao Windows (um único aviso, clique em Sim) e então executa o próprio comando interno do Windows',
	'av.whatAllowDoesIntroAfter':
		'para adicionar algumas entradas à lista de exclusões do Windows Defender:',
	'av.exclusionFoldersBefore': 'Sua',
	'av.gameFolder': 'pasta do jogo',
	'av.exclusionFoldersAnd': 'e a',
	'av.launcherFolder': 'pasta do launcher',
	'av.exclusionFoldersAfter':
		', para que os arquivos de mod dentro delas não sejam mais escaneados nem colocados em quarentena.',
	'av.exclusionExesAnd': 'e',
	'av.exclusionExesAfter':
		'como processos permitidos, para que não sejam bloqueados durante a execução.',
	'av.whatAllowDoesOutro':
		'Isto é exatamente o que você faria manualmente em Segurança do Windows, Proteção contra vírus e ameaças, Exclusões. Não instala nada, não executa nenhum software de terceiros e não altera nada fora desses caminhos específicos.',
	'av.back': 'Voltar',
	'addons.sectionInstalled': 'Instalados',
	'addons.sectionRecommended': 'Recomendados',
	'addons.sectionAvailable': 'Disponíveis',
	'addons.checkForUpdates': 'Procurar atualizações',
	'addons.addCustomGitAddon': 'Adicionar addon git personalizado',
	'addons.updateAll': 'Atualizar todos',
	'addons.everythingUpToDate': 'Tudo está atualizado.',
	'addons.installAddon': 'Instalar addon',
	'addons.previewAlt': 'Prévia',
	'addons.readyToInstall': 'Pronto para instalar',
	'addons.invalidGitUrl': 'URL de repositório git inválida',
	'addons.install': 'Instalar',
	'addons.warnIncorrectVersionFull':
		'Este addon parece ter sido feito para outra versão do jogo ({version}) e pode não funcionar corretamente',
	'addons.warnIncorrectVersionShort': 'Versão incorreta',
	'addons.warnMissingDependenciesFull':
		'Este addon tem dependências ausentes: {deps}',
	'addons.warnMissingDependenciesShort': 'Dependências ausentes',
	'addons.details': 'Detalhes',
	'addons.openOnGithub': 'Abrir {url} no GitHub',
	'addons.upToDate': 'Atualizado',
	'addons.notVersioned': 'Sem versionamento',
	'addons.update': 'Atualizar',
	'addons.ownCopy': 'Sua própria cópia',
	'addons.ownCopyHint':
		'Esta cópia de {name} não foi instalada pelo lançador, então é sua. O lançador a mantém e não a atualiza.',
	'addons.useLauncherVersion': 'Usar a versão do lançador',
	'addons.useLauncherVersionHint':
		'Instala a versão do lançador deste addon. Sua cópia é substituída e não é mantida.',
	'addons.edited': 'Editado',
	'addons.editedHint':
		'Você alterou arquivos deste addon. Ao atualizá-lo, suas alterações são sobrescritas.',
	'addons.download': 'Baixar',
	'addons.deleteConfirmTitle': 'Tem certeza?',
	'addons.deleteConfirmBody':
		'Tem certeza de que deseja excluir o addon {folder}?',
	'addons.deleteConfirmFiles':
		'Isso excluirá todos os arquivos da pasta do addon.',
	'addons.delete': 'Excluir',
	'addons.remove': 'Remover',
	'addons.detailSource': 'Fonte',
	'addons.openOnGithubShort': 'Abrir no GitHub',
	'addons.detailContributions': 'Contribuições',
	'addons.detailAddonVersion': 'Versão do addon',
	'addons.detailDependencies': 'Dependências',
	'addons.optional': '(opcional)',
	'prefs.mirrorOffline': 'offline',
	'prefs.mirrorChecking': 'verificando…',
	'prefs.mirrorOnline': 'online',
	'prefs.title': 'CONFIGURAÇÕES',
	'prefs.installLocation': 'LOCAL DE INSTALAÇÃO:',
	'prefs.openFolder': 'Abrir pasta',
	'prefs.notSelected': 'Não selecionado',
	'prefs.change': 'Alterar',
	'prefs.downloadMirror': 'ESPELHO DE DOWNLOAD:',
	'prefs.recheck': 'Verificar novamente',
	'prefs.troubleshooting': 'SOLUÇÃO DE PROBLEMAS:',
	'prefs.verifyGameFiles': 'Verificar arquivos do jogo',
	'prefs.openLogFile': 'Abrir arquivo de log',
	'prefs.allowThroughAntivirus': 'Permitir no antivírus',
	'prefs.exclusionAdded':
		'Adicionado. Verifique os arquivos do jogo novamente se algum tiver sido removido.',
	'prefs.generalSettings': 'CONFIGURAÇÕES GERAIS:',
	'prefs.cleanWdb': 'Limpar WDB a cada inicialização',
	'prefs.minimizeToTray': 'Minimizar para a bandeja durante o jogo',
	'prefs.proton': 'PROTON:',
	'prefs.useProton': 'Iniciar o jogo com o Proton',
	'prefs.protonVersion': 'Versão do Proton',
	'prefs.protonNone':
		'Nenhum Proton encontrado. Instale o Proton pela Steam ou coloque o GE-Proton na pasta compatibilitytools.d da Steam.',
	'launch.protonMissing':
		'A versão do Proton escolhida em Configurações não foi encontrada. Escolha outra ou desative o Proton e clique em Jogar novamente.',
	'prefs.save': 'Salvar',
	'prefs.installLocationTitle': 'Local de instalação',
	'prefs.portableInfo':
		'Você está usando a versão portátil do launcher. O local de instalação é definido pela localização do executável do launcher.',
	'prefs.errorLabel': 'Erro: ',
	'prefs.wowExeNotFound':
		'{exe} não encontrado na pasta atual. Feche o launcher e mova-o para o diretório do seu cliente do WoW 1.12.',
	'prefs.selectDirectory':
		'Selecione um diretório para a instalação do cliente do jogo.',
	'prefs.upgradeExisting':
		'Você também pode escolher um diretório com uma instalação existente do Turtle WoW ou Vanilla WoW, que será atualizada automaticamente.',
	'prefs.installDirectory': 'Diretório de instalação:',
	'prefs.noClientHere':
		'Não há {exe} nesta pasta. O launcher vai baixar um cliente novo aqui, sem os seus addons e configurações atuais. Se você já tem uma instalação, escolha a pasta dela.',
	'prefs.noClientHereConfirm': 'Entendi — baixar um cliente novo nesta pasta',
	'prefs.confirm': 'Confirmar',
	'misc.newsTitle': 'Notícias',
	'misc.newsByAuthor': 'por {author}',
	'misc.newsReadMore': 'Ler mais',
	'misc.refresh': 'Atualizar',
	'misc.newsLoading': 'Carregando notícias...',
	'misc.newsError': 'Não foi possível acessar o feed de notícias.',
	'misc.newsEmpty': 'Ainda não há notícias — volte mais tarde.',
	'misc.tryAgain': 'Tentar novamente',
	'misc.comingSoon': 'Em breve...',
	'misc.selfUpdateCheckFailed': 'Falha ao verificar atualizações',
	'misc.selfUpdateAvailable':
		'Atualização {version} do launcher disponível — preparando o download…',
	'misc.selfUpdateDownloading': 'Baixando a atualização {version} · {percent}%',
	'misc.selfUpdateReady':
		'Atualização {version} do launcher pronta para instalar',
	'misc.selfUpdateInstallNow': 'Instalar agora',
	'misc.tabCrashed': '{tab} travou',
	'misc.somethingWentWrong': 'Algo deu errado!',
	'misc.uncaughtError': '{name} não tratado: {message}',
	'misc.unknownError': 'Erro desconhecido',
	'misc.copyError': 'Copiar erro',
	'misc.reload': 'Recarregar'
};

const ruRU: Dict = {
	'tab.news': 'Новости',
	'tab.tweaks': 'Твики',
	'tab.addons': 'Аддоны',
	'tab.mods': 'Моды',
	'topbar.settings': 'Настройки',
	'topbar.minimize': 'Свернуть',
	'topbar.maximize': 'Развернуть',
	'topbar.restore': 'Восстановить',
	'topbar.quit': 'Выход',
	'topbar.language': 'Язык',
	'quit.title': 'Выйти?',
	'quit.warn': 'Игра обновляется. Выход сейчас может вызвать проблемы.',
	'quit.return': 'Назад',
	'launch.verifying': 'Проверка',
	'launch.play': 'Играть',
	'launch.retry': 'Повторить',
	'launch.install': 'Установить',
	'launch.update': 'Обновить',
	'launch.updating': 'Обновление',
	'launch.cancel': 'Отмена',
	'update.cancelled':
		'Загрузка остановлена. Нажмите Обновить, чтобы продолжить с того же места.',
	'update.stalled':
		'Загрузка перестала продвигаться. Нажмите Повторить, чтобы попробовать снова.',
	'update.diskFullSize':
		'Недостаточно свободного места: для загрузки нужно ещё около {size} на диске с игрой. Освободите место и нажмите Повторить.',
	'update.diskFull':
		'Недостаточно свободного места на диске с игрой. Освободите немного места и нажмите Повторить.',
	'update.network':
		'Не удалось связаться с серверами загрузки. Проверьте подключение и нажмите Повторить.',
	'update.fileAccess':
		'Не удалось записать файлы игры. Закройте игру и все программы, использующие её папку, проверьте антивирус и нажмите Повторить.',
	'update.downloaderMissing':
		'Программа загрузки (aria2c.exe) отсутствует, вероятно, её удалил антивирус. Восстановите её из карантина или переустановите лаунчер и нажмите Повторить.',
	'launch.applying': 'Применение',
	'launch.updateAvailable': 'Доступно обновление!',
	'launch.modsChanged': 'Моды изменены, примените перед игрой',
	'launch.upToDate': 'Всё обновлено!',
	'launch.version': 'Версия: {version}',
	'launch.errorLabel': 'Ошибка:',
	'launch.serverFail': 'Не удалось подключиться к серверу обновлений',
	'launch.localVersion': 'Вы можете запустить локальную версию {version}',
	'launch.tryLater': 'Повторите попытку позже',
	'launch.verifyHint': 'Проверьте данные игры, нажав Повторить.',
	'launch.remaining': 'осталось',
	'launch.calculating': 'вычисление…',
	'launch.onDisk': 'на диске',
	'launch.blockedByAntivirus':
		'Антивирус не дал запустить игру. Добавьте папку игры в исключения (Настройки, «Разрешить в антивирусе») и нажмите Играть ещё раз.',
	'launch.updateFirst':
		'Пока лаунчер был открыт, вышло обновление игры. Дождитесь, пока лаунчер завершит проверку и обновление, затем нажмите Играть.',
	'tweaks.raidVisuals.label': 'Улучшенные эффекты рейдов',
	'tweaks.raidVisuals.text':
		'Дополнительная загрузка (~9 МБ). Добавляет более заметные отметки на земле и звуки для способностей рейдовых боссов, автоматически синхронизируется с сервером. (также известен как Patch-O)',
	'tweaks.alwaysAutoLoot.label': 'Всегда автосбор',
	'tweaks.alwaysAutoLoot.text':
		'Меняет поведение автосбора на противоположное: всегда автоматически собирать добычу, а ручной сбор включается зажатой клавишей.',
	'tweaks.largeAddress.label': 'Large Address Aware',
	'tweaks.largeAddress.text': 'Позволяет игре использовать более 2 ГБ памяти.',
	'tweaks.nameplateRange.label': 'Дальность индикаторов',
	'tweaks.nameplateRange.text':
		'Увеличивает расстояние, на котором видны индикаторы (nameplate). [Vanilla: 20] [Classic: 41]',
	'tweaks.cameraHeading': 'Камера',
	'tweaks.fieldOfView.label': 'Поле зрения',
	'tweaks.fieldOfView.text':
		'Рекомендуется для широкоэкранных разрешений. [Vanilla: 90] [Tweaks: 110]',
	'tweaks.farClip.label': 'Дальность прорисовки',
	'tweaks.farClip.text':
		'Увеличивает максимальную дальность прорисовки. Слишком высокие значения могут привести к вылету при входе в мир. [Vanilla: 777]',
	'tweaks.farClip.recommendedHint': 'Рекомендовано для вашего ПК: {value}.',
	'tweaks.frillDistance.label': 'Дальность травы и деталей',
	'tweaks.frillDistance.text':
		'Изменяет дальность прорисовки травы и мелких деталей земли. [Vanilla: 70] [Tweaks: 300]',
	'tweaks.cameraDistance.label': 'Дальность камеры',
	'tweaks.cameraDistance.text':
		'Увеличивает максимальное отдаление камеры. [Vanilla: 50] [Max:100]',
	'tweaks.soundsHeading': 'Звук',
	'tweaks.soundInBackground.label': 'Звук в фоне',
	'tweaks.soundInBackground.text':
		'Позволяет воспроизводить звуки игры, когда она свёрнута.',
	'tweaks.applyFailed': 'Не удалось применить твики: {message}',
	'tweaks.highlighted': 'Выделенные',
	'tweaks.recommendedNote': 'параметры рекомендуются и включены по умолчанию',
	'tweaks.reset': 'Сбросить',
	'tweaks.apply': 'Применить',
	'mods.update': 'обновление',
	'mods.ignoreUpdates': 'Игнорировать обновления',
	'mods.ownFile': 'Ваш собственный файл',
	'mods.ownFileHint':
		'Вы заменили {files} своей копией. Лаунчер сохраняет её и никогда не изменяет, независимо от того, включён этот мод или нет.',
	'mods.useLauncherVersion': 'Использовать версию лаунчера',
	'mods.useLauncherVersionHint':
		'Возвращает {files} из лаунчера. Ваша копия заменяется и не сохраняется.',
	'mods.title': 'ПОЛЬЗОВАТЕЛЬСКИЕ МОДЫ',
	'mods.unsavedChanges': 'несохранённые изменения',
	'mods.warning':
		'Включение пользовательских модов может не дать прироста производительности или даже вызвать вылеты игры в зависимости от вашей системы. Если возникнут проблемы, попробуйте их отключить.',
	'mods.enableRequired': 'Включить {mods}, требуемые выбранными вами модами.',
	'mods.depRequired':
		'{mod} должен быть включён. Он требуется для {requiredBy}.',
	'mods.highlighted': 'Выделенные',
	'mods.highlightedRecommended': 'моды рекомендуются.',
	'mods.apply': 'Применить',
	'mods.cantApplyYet': 'ПОКА НЕЛЬЗЯ ПРИМЕНИТЬ',
	'mods.close': 'Закрыть',
	'av.blockedTitle': 'ЗАБЛОКИРОВАНО АНТИВИРУСОМ',
	'av.blockedOne': 'Windows Defender заблокировал этот мод:',
	'av.blockedMany': 'Windows Defender заблокировал эти моды:',
	'av.blockedExplain':
		'Это безопасные моды от сообщества, которые Defender ошибочно помечает как угрозу. Разрешите их один раз и повторите попытку.',
	'av.whyHappening': 'Почему так происходит?',
	'av.allowThrough': 'Разрешить в антивирусе',
	'av.addedRetry': 'Добавлено. Закройте это окно и повторите попытку.',
	'av.close': 'Закрыть',
	'av.whyTitle': 'ПОЧЕМУ АНТИВИРУС ПОМЕЧАЕТ МОДЫ',
	'av.whyIntro':
		'Некоторые из модов, устанавливаемых лаунчером, помечаются Windows Defender (или другим антивирусом) как угроза, например «{detection}». Это',
	'av.falsePositive': 'ложное срабатывание',
	'av.whatSetsItOff': 'Что вызывает срабатывание',
	'av.whatSetsItOffIntro':
		'Эти моды модернизируют 20-летний клиент игры 1.12, используя два приёма, которые выглядят подозрительно для эвристик антивируса:',
	'av.dllInjection': 'Внедрение DLL',
	'av.dllInjectionText':
		'моды загружают дополнительный код в работающую игру, чтобы добавить функции (компенсацию пинга, улучшенные индикаторы, производительность). Внедрение кода в чужую программу — это то, что делают и вредоносные программы, поэтому одно лишь такое поведение вызывает срабатывание сканера.',
	'av.exePatching': 'Патчинг исполняемого файла',
	'av.exePatchingText':
		'некоторые моды изменяют WoW.exe, чтобы снять старые ограничения движка (например, позволить 32-битному клиенту использовать 4 ГБ ОЗУ вместо 2 ГБ). Изменение исполняемого файла — ещё один паттерн, характерный для вредоносных программ.',
	'av.heuristicNote':
		'Поскольку это срабатывания на основе поведения (эвристические), а не совпадения с реальными вредоносными программами, легитимные моды, использующие эти приёмы, попадают под ложные срабатывания как обобщённый «троян» или «hacktool».',
	'av.whatModsDo': 'Что моды делают на самом деле',
	'av.modVanillaFixes':
		'загрузчик, который исправляет подёргивания и ошибки таймеров и запускает остальные моды.',
	'av.modNampower':
		'компенсация пинга, чтобы заклинания ощущались отзывчиво при высокой задержке.',
	'av.modSuperWowUnitXp':
		'расширенный Lua, настоящие индикаторы, улучшения камеры и прицеливания.',
	'av.modDxvk':
		'переводит старый DirectX 9 в современный Vulkan для значительного прироста FPS.',
	'av.howToVerify': 'Как проверить эти утверждения',
	'av.howToVerifyText':
		'Это проекты сообщества с открытым исходным кодом. Вы можете прочитать каждую строку кода любого мода по ссылке на исходники рядом с ним в списке модов, а также найти название обнаружения (например, «{detection}») и убедиться, что это задокументированное ложное срабатывание на этих инструментах.',
	'av.whatAllowDoesTitle': 'Что делает «Разрешить в антивирусе»',
	'av.whatAllowDoesIntro':
		'Эта функция запрашивает у Windows права администратора (одно окно, нажмите «Да»), затем запускает встроенную в Windows',
	'av.whatAllowDoesIntroAfter':
		'команду, чтобы добавить несколько записей в список исключений Windows Defender:',
	'av.exclusionFoldersBefore': 'Вашу',
	'av.gameFolder': 'папку игры',
	'av.exclusionFoldersAnd': 'и',
	'av.launcherFolder': 'папку лаунчера',
	'av.exclusionFoldersAfter':
		', чтобы файлы модов в них больше не сканировались и не помещались в карантин.',
	'av.exclusionExesAnd': 'и',
	'av.exclusionExesAfter':
		'как разрешённые процессы, чтобы они не блокировались во время работы.',
	'av.whatAllowDoesOutro':
		'Это то же самое, что вы сделали бы вручную в разделе «Безопасность Windows» → «Защита от вирусов и угроз» → «Исключения». Она ничего не устанавливает, не запускает стороннее ПО и не меняет ничего за пределами этих конкретных путей.',
	'av.back': 'Назад',
	'addons.sectionInstalled': 'Установленные',
	'addons.sectionRecommended': 'Рекомендуемые',
	'addons.sectionAvailable': 'Доступные',
	'addons.checkForUpdates': 'Проверить обновления',
	'addons.addCustomGitAddon': 'Добавить аддон из git',
	'addons.updateAll': 'Обновить все',
	'addons.everythingUpToDate': 'Всё актуально.',
	'addons.installAddon': 'Установить аддон',
	'addons.previewAlt': 'Превью',
	'addons.readyToInstall': 'Готов к установке',
	'addons.invalidGitUrl': 'Недействительный URL git-репозитория',
	'addons.install': 'Установить',
	'addons.warnIncorrectVersionFull':
		'Похоже, этот аддон сделан для другой версии игры ({version}), и он может работать некорректно',
	'addons.warnIncorrectVersionShort': 'Неверная версия',
	'addons.warnMissingDependenciesFull':
		'У этого аддона отсутствуют зависимости: {deps}',
	'addons.warnMissingDependenciesShort': 'Отсутствуют зависимости',
	'addons.details': 'Подробнее',
	'addons.openOnGithub': 'Открыть {url} на GitHub',
	'addons.upToDate': 'Актуально',
	'addons.notVersioned': 'Без версии',
	'addons.update': 'Обновить',
	'addons.ownCopy': 'Ваша собственная копия',
	'addons.ownCopyHint':
		'Эта копия {name} установлена не лаунчером, поэтому она ваша. Лаунчер сохраняет её и не обновляет.',
	'addons.useLauncherVersion': 'Использовать версию лаунчера',
	'addons.useLauncherVersionHint':
		'Устанавливает версию этого аддона из лаунчера. Ваша копия заменяется и не сохраняется.',
	'addons.edited': 'Изменён',
	'addons.editedHint':
		'Вы изменили файлы этого аддона. При обновлении ваши изменения будут перезаписаны.',
	'addons.download': 'Скачать',
	'addons.deleteConfirmTitle': 'Вы уверены?',
	'addons.deleteConfirmBody': 'Вы уверены, что хотите удалить аддон {folder}?',
	'addons.deleteConfirmFiles': 'Это удалит все файлы в папке аддона.',
	'addons.delete': 'Удалить',
	'addons.remove': 'Убрать',
	'addons.detailSource': 'Исходник',
	'addons.openOnGithubShort': 'Открыть на GitHub',
	'addons.detailContributions': 'Вклад',
	'addons.detailAddonVersion': 'Версия аддона',
	'addons.detailDependencies': 'Зависимости',
	'addons.optional': '(необязательно)',
	'prefs.mirrorOffline': 'недоступно',
	'prefs.mirrorChecking': 'проверка…',
	'prefs.mirrorOnline': 'в сети',
	'prefs.title': 'НАСТРОЙКИ',
	'prefs.installLocation': 'ПАПКА УСТАНОВКИ:',
	'prefs.openFolder': 'Открыть папку',
	'prefs.notSelected': 'Не выбрано',
	'prefs.change': 'Изменить',
	'prefs.downloadMirror': 'ЗЕРКАЛО ЗАГРУЗКИ:',
	'prefs.recheck': 'Перепроверить',
	'prefs.troubleshooting': 'УСТРАНЕНИЕ НЕПОЛАДОК:',
	'prefs.verifyGameFiles': 'Проверить файлы игры',
	'prefs.openLogFile': 'Открыть файл журнала',
	'prefs.allowThroughAntivirus': 'Разрешить в антивирусе',
	'prefs.exclusionAdded':
		'Добавлено. Перепроверьте файлы игры, если какие-то из них были удалены.',
	'prefs.generalSettings': 'ОБЩИЕ НАСТРОЙКИ:',
	'prefs.cleanWdb': 'Очищать WDB при каждом запуске',
	'prefs.minimizeToTray': 'Сворачивать в трей во время игры',
	'prefs.proton': 'PROTON:',
	'prefs.useProton': 'Запускать игру через Proton',
	'prefs.protonVersion': 'Версия Proton',
	'prefs.protonNone':
		'Proton не найден. Установите Proton в Steam или поместите GE-Proton в папку compatibilitytools.d в Steam.',
	'launch.protonMissing':
		'Версия Proton, выбранная в настройках, не найдена. Выберите другую или отключите Proton, затем нажмите Играть ещё раз.',
	'prefs.save': 'Сохранить',
	'prefs.installLocationTitle': 'Папка установки',
	'prefs.portableInfo':
		'Вы используете портативную версию лаунчера. Папка установки определяется расположением исполняемого файла лаунчера.',
	'prefs.errorLabel': 'Ошибка: ',
	'prefs.wowExeNotFound':
		'{exe} не найден в текущей папке. Закройте лаунчер и переместите его в папку с клиентом WoW 1.12.',
	'prefs.selectDirectory': 'Выберите папку для установки клиента игры.',
	'prefs.upgradeExisting':
		'Вы также можете выбрать папку с уже установленным Turtle WoW или Vanilla WoW, и она будет автоматически обновлена.',
	'prefs.installDirectory': 'Папка установки:',
	'prefs.noClientHere':
		'В этой папке нет {exe}. Лаунчер скачает сюда новый клиент, в котором не будет ваших текущих аддонов и настроек. Если игра уже установлена, выберите её папку.',
	'prefs.noClientHereConfirm': 'Понятно — скачать новый клиент в эту папку',
	'prefs.confirm': 'Подтвердить',
	'misc.newsTitle': 'Новости',
	'misc.newsByAuthor': 'от {author}',
	'misc.newsReadMore': 'Читать далее',
	'misc.refresh': 'Обновить',
	'misc.newsLoading': 'Загрузка новостей...',
	'misc.newsError': 'Не удалось получить ленту новостей.',
	'misc.newsEmpty': 'Новостей пока нет — загляните позже.',
	'misc.tryAgain': 'Повторить',
	'misc.comingSoon': 'Скоро...',
	'misc.selfUpdateCheckFailed': 'Не удалось проверить обновления',
	'misc.selfUpdateAvailable':
		'Доступно обновление лаунчера {version} — подготовка загрузки…',
	'misc.selfUpdateDownloading': 'Загрузка обновления {version} · {percent}%',
	'misc.selfUpdateReady': 'Обновление лаунчера {version} готово к установке',
	'misc.selfUpdateInstallNow': 'Установить сейчас',
	'misc.tabCrashed': 'Вкладка {tab} аварийно завершилась',
	'misc.somethingWentWrong': 'Что-то пошло не так!',
	'misc.uncaughtError': 'Необработанная ошибка {name}: {message}',
	'misc.unknownError': 'Неизвестная ошибка',
	'misc.copyError': 'Скопировать ошибку',
	'misc.reload': 'Перезагрузить'
};

const koKR: Dict = {
	'tab.news': '뉴스',
	'tab.tweaks': '트윅',
	'tab.addons': '애드온',
	'tab.mods': '모드',
	'topbar.settings': '설정',
	'topbar.minimize': '최소화',
	'topbar.maximize': '최대화',
	'topbar.restore': '이전 크기로',
	'topbar.quit': '종료',
	'topbar.language': '언어',
	'quit.title': '종료하시겠습니까?',
	'quit.warn':
		'게임을 업데이트하는 중입니다. 지금 종료하면 문제가 발생할 수 있습니다.',
	'quit.return': '돌아가기',
	'launch.verifying': '검사 중',
	'launch.play': '게임 시작',
	'launch.retry': '다시 시도',
	'launch.install': '설치',
	'launch.update': '업데이트',
	'launch.updating': '업데이트 중',
	'launch.cancel': '취소',
	'update.cancelled':
		'다운로드가 중지되었습니다. ‘업데이트’를 클릭하여 중단된 지점부터 이어서 받으세요.',
	'update.stalled':
		'다운로드가 더 이상 진행되지 않습니다. ‘다시 시도’를 클릭하세요.',
	'update.diskFullSize':
		'디스크 여유 공간이 부족합니다. 다운로드하려면 게임이 설치된 드라이브에 약 {size}의 공간이 더 필요합니다. 공간을 확보한 후 ‘다시 시도’를 클릭하세요.',
	'update.diskFull':
		'게임이 설치된 드라이브의 여유 공간이 부족합니다. 공간을 확보한 후 ‘다시 시도’를 클릭하세요.',
	'update.network':
		'다운로드 서버에 연결할 수 없습니다. 인터넷 연결을 확인한 후 ‘다시 시도’를 클릭하세요.',
	'update.fileAccess':
		'게임 파일을 기록할 수 없습니다. 게임을 종료하고 게임 폴더를 사용 중인 프로그램도 모두 닫은 다음, 백신 프로그램을 확인한 후 ‘다시 시도’를 클릭하세요.',
	'update.downloaderMissing':
		'다운로더(aria2c.exe)가 없으며, 백신 프로그램이 삭제했을 가능성이 높습니다. 격리 항목에서 복원하거나 런처를 다시 설치한 후 ‘다시 시도’를 클릭하세요.',
	'launch.applying': '적용 중',
	'launch.updateAvailable': '업데이트가 있습니다!',
	'launch.modsChanged': '모드가 변경되었으니 플레이 전에 적용하세요',
	'launch.upToDate': '모두 최신 상태입니다!',
	'launch.version': '버전: {version}',
	'launch.errorLabel': '오류:',
	'launch.serverFail': '업데이트 서버에 연결하지 못했습니다',
	'launch.localVersion': '로컬 버전({version})을 실행할 수 있습니다',
	'launch.tryLater': '나중에 다시 시도하세요',
	'launch.verifyHint': '‘다시 시도’를 클릭하여 게임 데이터를 검사하세요.',
	'launch.remaining': '남음',
	'launch.calculating': '계산 중…',
	'launch.onDisk': '디스크에 저장됨',
	'launch.blockedByAntivirus':
		'백신 프로그램이 게임 실행을 차단했습니다. ‘설정’의 ‘백신 예외 등록’에서 게임 폴더를 예외로 등록한 후 ‘게임 시작’을 다시 클릭하세요.',
	'launch.updateFirst':
		'런처가 열려 있는 동안 게임 업데이트가 나왔습니다. 런처가 확인과 업데이트를 마칠 때까지 기다린 후 ‘게임 시작’을 클릭하세요.',
	'tweaks.raidVisuals.label': '개선된 공격대 효과',
	'tweaks.raidVisuals.text':
		'약 9 MB 크기의 선택 다운로드입니다. 공격대 우두머리 능력에 더 선명한 바닥 표시와 효과음을 추가하며, 서버와 자동으로 동기화됩니다. (일명 Patch-O)',
	'tweaks.alwaysAutoLoot.label': '항상 자동 전리품 획득',
	'tweaks.alwaysAutoLoot.text':
		'자동 전리품 획득 방식을 반대로 바꿔 항상 자동으로 획득하고, 지정한 키를 누른 상태에서는 자동 획득을 끕니다.',
	'tweaks.largeAddress.label': 'Large Address Aware',
	'tweaks.largeAddress.text':
		'게임이 2GB보다 많은 메모리를 사용할 수 있게 합니다.',
	'tweaks.nameplateRange.label': '이름표 표시 거리',
	'tweaks.nameplateRange.text':
		'이름표가 보이는 거리를 늘립니다. [바닐라: 20] [클래식: 41]',
	'tweaks.cameraHeading': '카메라',
	'tweaks.fieldOfView.label': '시야각',
	'tweaks.fieldOfView.text':
		'와이드스크린 창 해상도에 권장합니다. [바닐라: 90] [트윅: 110]',
	'tweaks.farClip.label': '시야 거리',
	'tweaks.farClip.text':
		'최대 시야 거리를 늘립니다. 값이 너무 높으면 월드에 입장할 때 게임이 비정상 종료될 수 있습니다. [바닐라: 777]',
	'tweaks.farClip.recommendedHint': '이 PC의 권장값: {value}.',
	'tweaks.frillDistance.label': '지면 사물 거리',
	'tweaks.frillDistance.text':
		'지면 사물이 표시되는 거리를 변경합니다. [바닐라: 70] [트윅: 300]',
	'tweaks.cameraDistance.label': '카메라 거리',
	'tweaks.cameraDistance.text':
		'카메라를 멀리 뺄 수 있는 최대 거리를 늘립니다. [바닐라: 50] [최대: 100]',
	'tweaks.soundsHeading': '소리',
	'tweaks.soundInBackground.label': '백그라운드 소리',
	'tweaks.soundInBackground.text':
		'게임이 최소화된 상태에서도 게임 소리가 재생되도록 합니다.',
	'tweaks.applyFailed': '트윅 적용 실패: {message}',
	'tweaks.highlighted': '강조 표시된',
	'tweaks.recommendedNote':
		'옵션은 권장 항목이며 기본적으로 활성화되어 있습니다',
	'tweaks.reset': '초기화',
	'tweaks.apply': '적용',
	'mods.update': '업데이트 가능',
	'mods.ignoreUpdates': '업데이트 무시',
	'mods.ownFile': '내 파일',
	'mods.ownFileHint':
		'{files} 파일이 사용자의 사본으로 교체되어 있습니다. 이 모드의 체크 여부와 관계없이 런처는 이 파일을 그대로 유지하며 절대 변경하지 않습니다.',
	'mods.useLauncherVersion': '런처 버전 사용',
	'mods.useLauncherVersionHint':
		'런처의 {files} 파일로 되돌립니다. 사용자의 사본은 교체되며 보관되지 않습니다.',
	'mods.title': '사용자 지정 모드',
	'mods.unsavedChanges': '저장되지 않은 변경 사항',
	'mods.warning':
		'사용자 지정 모드를 활성화해도 시스템에 따라 성능이 향상되지 않거나 오히려 게임이 비정상 종료될 수 있습니다. 문제가 발생하면 모드를 비활성화해 보세요.',
	'mods.enableRequired': '선택한 모드에 필요한 {mods} 모드를 활성화하세요.',
	'mods.depRequired':
		'{mod} 모드를 활성화해야 합니다. {requiredBy}에 필요한 모드입니다.',
	'mods.highlighted': '강조 표시된',
	'mods.highlightedRecommended': '모드를 권장합니다.',
	'mods.apply': '적용',
	'mods.cantApplyYet': '아직 적용할 수 없음',
	'mods.close': '닫기',
	'av.blockedTitle': '백신 프로그램에서 차단됨',
	'av.blockedOne': 'Windows Defender가 이 모드를 차단했습니다:',
	'av.blockedMany': 'Windows Defender가 다음 모드를 차단했습니다:',
	'av.blockedExplain':
		'이 모드들은 Defender가 잘못 탐지하는 안전한 커뮤니티 모드입니다. 한 번 허용해 둔 후 다시 시도하세요.',
	'av.whyHappening': '왜 이런 일이 발생하나요?',
	'av.close': '닫기',
	'av.whyTitle': '백신 프로그램이 모드를 탐지하는 이유',
	'av.whyIntro':
		'런처가 설치하는 일부 모드는 Windows Defender(또는 다른 백신 프로그램)에서 "{detection}" 같은 위협으로 탐지됩니다. 이는',
	'av.falsePositive': '오탐지입니다',
	'av.whatSetsItOff': '탐지되는 원인',
	'av.whatSetsItOffIntro':
		'이 모드들은 20년 된 1.12 게임 클라이언트를 현대화하는 데 백신 프로그램의 휴리스틱 검사가 의심스럽게 보는 두 가지 기술을 사용합니다:',
	'av.dllInjection': 'DLL 인젝션',
	'av.dllInjectionText':
		'모드가 실행 중인 게임에 추가 코드를 불러와 기능(핑 보정, 개선된 이름표, 성능 향상)을 더합니다. 다른 프로그램에 코드를 불러오는 것은 악성 코드도 하는 동작이므로, 이 동작만으로도 검사에 걸립니다.',
	'av.exePatching': '실행 파일 패치',
	'av.exePatchingText':
		'일부 모드는 오래된 엔진의 제한을 풀기 위해 WoW.exe 파일을 수정합니다(예: 32비트 클라이언트가 2GB 대신 4GB RAM을 사용하도록 허용). 실행 파일을 수정하는 것 또한 악성 코드에서 흔히 보이는 패턴입니다.',
	'av.heuristicNote':
		'이러한 탐지는 실제 악성 코드와 일치해서가 아니라 동작을 기준으로 이루어지므로, 이 기술을 사용하는 정상적인 모드도 일반적인 "trojan" 또는 "hacktool" 유형으로 잘못 탐지됩니다.',
	'av.whatModsDo': '모드가 실제로 하는 일',
	'av.modVanillaFixes':
		'끊김 현상과 타이머 버그를 수정하고 다른 모드를 실행하는 로더입니다.',
	'av.modNampower':
		'지연 시간이 높아도 주문 시전이 빠르게 반응하도록 하는 핑 보정 기능입니다.',
	'av.modSuperWowUnitXp':
		'고급 Lua 기능, 진짜 이름표, 카메라 및 대상 지정 개선을 제공합니다.',
	'av.modDxvk':
		'오래된 DirectX 9를 최신 Vulkan으로 변환하여 FPS를 크게 높입니다.',
	'av.howToVerify': '이 내용을 직접 확인하는 방법',
	'av.howToVerifyText':
		'이 모드들은 오픈 소스 커뮤니티 프로젝트입니다. ‘모드’ 탭 목록에서 각 모드 옆에 있는 소스 링크를 통해 모든 코드를 한 줄씩 읽어 볼 수 있으며, 탐지 이름(예: "{detection}")을 검색하면 이 도구들에 대해 문서화된 오탐지임을 확인할 수 있습니다.',
	'av.back': '뒤로',
	'addons.sectionInstalled': '설치됨',
	'addons.sectionRecommended': '추천',
	'addons.sectionAvailable': '설치 가능',
	'addons.checkForUpdates': '업데이트 확인',
	'addons.addCustomGitAddon': '사용자 지정 git 애드온 추가',
	'addons.updateAll': '모두 업데이트',
	'addons.everythingUpToDate': '모든 항목이 최신 상태입니다.',
	'addons.installAddon': '애드온 설치',
	'addons.previewAlt': '미리 보기',
	'addons.readyToInstall': '설치 준비 완료',
	'addons.invalidGitUrl': '올바른 git 저장소 URL이 아닙니다',
	'addons.install': '설치',
	'addons.warnIncorrectVersionFull':
		'이 애드온은 다른 게임 버전({version})용으로 제작된 것으로 보이며 제대로 작동하지 않을 수 있습니다',
	'addons.warnIncorrectVersionShort': '버전 불일치',
	'addons.warnMissingDependenciesFull':
		'이 애드온의 종속성이 누락되었습니다: {deps}',
	'addons.warnMissingDependenciesShort': '종속성 누락',
	'addons.details': '세부 정보',
	'addons.openOnGithub': 'GitHub에서 {url} 열기',
	'addons.upToDate': '최신 상태',
	'addons.notVersioned': '버전 정보 없음',
	'addons.update': '업데이트',
	'addons.ownCopy': '내 사본',
	'addons.ownCopyHint':
		'이 {name} 사본은 런처가 설치하지 않았으므로 사용자의 사본으로 간주합니다. 런처는 이 사본을 유지하며 업데이트하지 않습니다.',
	'addons.useLauncherVersion': '런처 버전 사용',
	'addons.useLauncherVersionHint':
		'이 애드온을 런처 버전으로 설치합니다. 사용자의 사본은 교체되며 보관되지 않습니다.',
	'addons.edited': '수정됨',
	'addons.editedHint':
		'이 애드온의 파일이 수정되었습니다. 업데이트하면 수정한 내용을 덮어씁니다.',
	'addons.download': '다운로드',
	'addons.deleteConfirmTitle': '삭제 확인',
	'addons.deleteConfirmBody': '{folder} 애드온을 정말 삭제하시겠습니까?',
	'addons.deleteConfirmFiles': '애드온 폴더의 모든 파일이 삭제됩니다.',
	'addons.delete': '삭제',
	'addons.remove': '제거',
	'addons.detailSource': '소스',
	'addons.openOnGithubShort': 'GitHub에서 열기',
	'addons.detailContributions': '기여자',
	'addons.detailAddonVersion': '애드온 버전',
	'addons.detailDependencies': '종속성',
	'addons.optional': '(선택 사항)',
	'prefs.mirrorOffline': '오프라인',
	'prefs.mirrorChecking': '확인 중…',
	'prefs.mirrorOnline': '온라인',
	'prefs.title': '설정',
	'prefs.installLocation': '설치 위치:',
	'prefs.openFolder': '폴더 열기',
	'prefs.notSelected': '선택 안 됨',
	'prefs.change': '변경',
	'prefs.downloadMirror': '다운로드 미러:',
	'prefs.recheck': '다시 확인',
	'prefs.troubleshooting': '문제 해결:',
	'prefs.verifyGameFiles': '게임 파일 검사',
	'prefs.openLogFile': '로그 파일 열기',
	'prefs.allowThroughAntivirus': '백신 예외 등록',
	'prefs.generalSettings': '일반 설정:',
	'prefs.cleanWdb': '게임을 시작할 때마다 WDB 정리',
	'prefs.minimizeToTray': '게임 중 트레이로 최소화',
	'prefs.proton': 'PROTON:',
	'prefs.useProton': 'Proton으로 게임 실행',
	'prefs.protonVersion': 'Proton 버전',
	'prefs.protonNone':
		'Proton을 찾을 수 없습니다. Steam에서 Proton을 설치하거나 GE-Proton을 Steam의 compatibilitytools.d 폴더에 넣으세요.',
	'launch.protonMissing':
		'‘설정’에서 선택한 Proton 버전을 찾을 수 없습니다. 다른 버전을 선택하거나 Proton을 끈 후 ‘게임 시작’을 다시 클릭하세요.',
	'prefs.save': '저장',
	'prefs.installLocationTitle': '설치 위치',
	'prefs.portableInfo':
		'포터블 버전의 런처를 사용 중입니다. 설치 위치는 런처 실행 파일이 있는 위치로 결정됩니다.',
	'prefs.errorLabel': '오류: ',
	'prefs.wowExeNotFound':
		'현재 폴더에서 {exe} 파일을 찾을 수 없습니다. 런처를 종료한 후 WoW 1.12 클라이언트 폴더로 옮기세요.',
	'prefs.selectDirectory': '게임 클라이언트를 설치할 폴더를 선택하세요.',
	'prefs.upgradeExisting':
		'기존 Turtle WoW 또는 Vanilla WoW가 설치된 폴더를 선택할 수도 있으며, 이 경우 자동으로 업그레이드됩니다.',
	'prefs.installDirectory': '설치 폴더:',
	'prefs.noClientHere':
		'이 폴더에 {exe} 파일이 없습니다. 런처가 이곳에 새 클라이언트를 다운로드하며, 이 클라이언트에는 기존 애드온이나 설정이 포함되지 않습니다. 이미 설치된 게임이 있다면 대신 그 폴더를 선택하세요.',
	'prefs.noClientHereConfirm':
		'내용을 이해했으며, 이 폴더에 새 클라이언트를 다운로드합니다',
	'prefs.confirm': '확인',
	'misc.newsByAuthor': '작성자: {author}',
	'misc.newsReadMore': '더 보기',
	'misc.refresh': '새로 고침',
	'misc.newsLoading': '뉴스를 불러오는 중...',
	'misc.newsError': '뉴스 피드에 연결할 수 없습니다.',
	'misc.newsEmpty': '아직 뉴스가 없습니다. 나중에 다시 확인하세요.',
	'misc.tryAgain': '다시 시도',
	'misc.comingSoon': '곧 공개됩니다...',
	'misc.selfUpdateCheckFailed': '업데이트 확인 실패',
	'misc.selfUpdateAvailable':
		'런처 업데이트 {version} 사용 가능, 다운로드 준비 중…',
	'misc.selfUpdateDownloading': '업데이트 {version} 다운로드 중 · {percent}%',
	'misc.selfUpdateReady': '런처 업데이트 {version} 설치 준비 완료',
	'misc.selfUpdateInstallNow': '지금 설치',
	'misc.tabCrashed': '{tab} 탭이 비정상 종료되었습니다',
	'misc.somethingWentWrong': '문제가 발생했습니다!',
	'misc.uncaughtError': '처리되지 않은 {name}: {message}',
	'misc.unknownError': '알 수 없는 오류',
	'misc.copyError': '오류 내용 복사',
	'misc.reload': '다시 불러오기',
	'misc.announcementsTitle': '공지 사항',
	'misc.patchNotesTitle': '패치 노트',
	'misc.close': '닫기',
	'misc.pickFile': '찾아보기',
	'mods.missingFiles':
		'다음 모드의 게임 파일이 없습니다: {mods}. 클라이언트를 재동기화하여 복원하세요. 백신 프로그램이 차단하고 있다면 먼저 허용하세요.',
	'mods.reverify': '클라이언트 재동기화',
	'mods.yourDlls': '내 DLL 모드',
	'mods.yourDllsEmpty':
		'게임 폴더에 .dll 파일을 넣거나 위의 ‘DLL 추가’를 클릭하여 추가하면 여기에서 켜고 끌 수 있습니다.',
	'mods.addDll': 'DLL 추가',
	'mods.addDllTitle': 'DLL 모드 선택',
	'mods.addDllFailed': 'DLL을 추가하지 못했습니다.',
	'mods.applied': '적용됨',
	'av.howToAllowTitle': '모드를 허용하는 방법',
	'av.guideIntro':
		'런처는 백신 프로그램 설정을 직접 변경하지 않습니다. Windows Defender는 그렇게 하는 프로그램을 악성 코드로 취급하기 때문입니다. Windows 보안에서 제외 사항을 직접 추가하는 데는 잠깐이면 충분합니다.',
	'av.step1':
		'1. Windows 보안을 열고 ‘제외’ 항목까지 스크롤하여 ‘제외 추가 또는 제거’를 선택한 다음, ‘제외 사항 추가’ > ‘폴더’를 선택하여 다음 폴더를 각각 추가하세요:',
	'av.openWindowsSecurity': 'Windows 보안 열기',
	'av.openFailed':
		'Windows 보안이 열리지 않았습니다. 시작 메뉴에서 Windows 보안을 찾은 다음 ‘바이러스 및 위협 방지’ > ‘설정 관리’ > ‘제외 추가 또는 제거’로 이동하세요.',
	'av.copy': '복사',
	'av.copied': '복사됨',
	'av.step2': '2. 그런 다음 Defender가 삭제한 파일을 복원하세요:',
	'av.restoreFiles': '차단된 파일 복원',
	'av.checkAgain': '다시 확인',
	'av.allClear':
		'이제 차단된 항목이 없습니다. 게임을 시작할 준비가 되었습니다.',
	'av.checking': '확인 중...',
	'av.checkStillBlocked':
		'아직 차단된 파일: {files}. 두 폴더가 모두 제외 목록에 있는지 확인한 후 ‘차단된 파일 복원’을 사용하세요.',
	'av.checkFailed': '지금은 확인할 수 없습니다. 잠시 후 다시 시도하세요.',
	'av.restoring': '파일을 복원하는 중입니다. 잠시 시간이 걸릴 수 있습니다.',
	'av.restoreDoneFiles':
		'{files} 파일을 복원했습니다. 이제 차단된 항목이 없습니다. 게임을 시작할 준비가 되었습니다.',
	'av.restorePartial':
		'{restored} 파일을 복원했지만, 다음 파일은 아직 차단되어 있습니다: {files}. 두 폴더가 모두 제외 목록에 있는지 확인한 후 다시 시도하세요.',
	'av.restoreNone':
		'다음 파일은 아직 차단되어 있습니다: {files}. 두 폴더가 모두 제외 목록에 있는지 확인한 후 다시 시도하세요. 계속 차단되면 Windows 보안의 ‘보호 기록’에서 복원하세요.',
	'av.restoreNoClient': '먼저 게임 폴더를 설정한 후 다시 시도하세요.',
	'av.restoreGameRunning': '먼저 게임을 종료한 후 다시 시도하세요.',
	'av.restoreBusy':
		'런처가 이미 게임을 업데이트하는 중입니다. 완료될 때까지 기다린 후 다시 시도하세요.',
	'av.restoreServer':
		'다운로드 서버에 연결할 수 없습니다. 몇 분 후 다시 시도하세요.',
	'av.restoreIncomplete':
		'일부 파일을 아직 다운로드하지 못했습니다. 몇 분 후 다시 시도하세요.',
	'av.restoreFailed':
		'파일을 복원하지 못했습니다. 다시 시도하거나 ‘설정’의 ‘게임 파일 검사’를 사용하세요.',
	'av.howToAllowText':
		'Windows 보안에서 ‘바이러스 및 위협 방지’ > ‘설정 관리’ > ‘제외 추가 또는 제거’로 이동하여 게임 폴더와 런처 폴더를 ‘폴더’ 제외 사항으로 추가하세요. 그러면 Defender가 두 폴더에 있는 모드 파일을 더 이상 검사하거나 삭제하지 않습니다. 그런 다음 ‘차단된 파일 복원’(또는 ‘설정’의 ‘게임 파일 검사’)을 사용하여 이미 삭제된 항목을 되돌리세요.',
	'av.howToAllowSafety':
		'런처는 일부러 이 작업을 대신 하지 않습니다. 백신 프로그램 설정을 스스로 변경하는 프로그램은 Windows Defender에는 악성 코드처럼 보이기 때문입니다. 제외 사항을 직접 추가하는 것이 안전한 방법이며, 언제든지 같은 화면에서 다시 제거할 수 있습니다.',
	'prefs.shareDownloads': '다운로드 공유로 다른 플레이어 돕기',
	'priority.active': '우선 접속 사용 중',
	'priority.signOut': '로그아웃',
	'priority.signIn': '우선 접속을 위해 로그인',
	'priority.tryAgain': '우선 접속 다시 시도',
	'priority.finishInBrowser':
		'웹 브라우저에서 로그인을 완료한 후 이곳으로 돌아오세요.',
	'priority.standardLogin': '일반 접속을 사용 중입니다.',
	'priority.accountTooNew':
		'우선 접속을 사용하려면 계정이 생성된 지 24시간 이상 지나야 합니다.',
	'priority.notGoodStanding': '이 계정은 우선 접속 대상이 아닙니다.',
	'priority.emailUnverified': '우선 접속을 사용하려면 이메일을 인증하세요.',
	'priority.hostingOrVpn':
		'VPN 또는 호스팅 연결에서는 우선 접속을 사용할 수 없습니다. 가정용 네트워크에서 연결하세요.',
	'priority.sharedVpnIp':
		'이 VPN 연결에서 이미 다른 계정이 우선 접속을 사용하고 있습니다. 다른 연결로 바꾸거나 일반 접속을 사용하세요.',
	'priority.notOnThisConnection':
		'이 연결에서는 우선 접속을 사용할 수 없습니다.',
	'priority.noCharacter':
		'우선 접속을 잠금 해제하려면 먼저 이 계정으로 게임을 플레이하세요.',
	'priority.notInRollout':
		'이 계정에는 아직 우선 접속이 활성화되지 않았습니다. 일반 접속을 사용 중입니다.',
	'priority.notAvailableNow':
		'지금은 우선 접속을 사용할 수 없습니다. 일반 접속을 사용 중입니다.'
};

const frFR: Dict = {
	'tab.news': 'Actualités',
	'tab.tweaks': 'Ajustements',
	'tab.addons': 'AddOns',
	'tab.mods': 'Mods',
	'topbar.settings': 'Paramètres',
	'topbar.minimize': 'Réduire',
	'topbar.maximize': 'Agrandir',
	'topbar.restore': 'Restaurer',
	'topbar.quit': 'Quitter',
	'topbar.language': 'Langue',
	'quit.title': 'Quitter ?',
	'quit.warn':
		'Votre jeu est en cours de mise à jour. Quitter maintenant peut causer des problèmes.',
	'quit.return': 'Retour',
	'launch.verifying': 'Vérification',
	'launch.play': 'Jouer',
	'launch.retry': 'Réessayer',
	'launch.install': 'Installer',
	'launch.update': 'Mettre à jour',
	'launch.updating': 'Mise à jour',
	'launch.cancel': 'Annuler',
	'update.cancelled':
		"Téléchargement interrompu. Cliquez sur « Mettre à jour » pour reprendre là où il s'était arrêté.",
	'update.stalled':
		'Le téléchargement ne progresse plus. Cliquez sur « Réessayer » pour faire une nouvelle tentative.',
	'update.diskFullSize':
		"Espace disque insuffisant : il manque environ {size} sur le disque du jeu pour le téléchargement. Libérez de l'espace, puis cliquez sur « Réessayer ».",
	'update.diskFull':
		"Espace libre insuffisant sur le disque du jeu. Libérez un peu d'espace, puis cliquez sur « Réessayer ».",
	'update.network':
		'Impossible de joindre les serveurs de téléchargement. Vérifiez votre connexion, puis cliquez sur « Réessayer ».',
	'update.fileAccess':
		"Impossible d'écrire les fichiers du jeu. Fermez le jeu et tout programme qui utilise son dossier, vérifiez votre antivirus, puis cliquez sur « Réessayer ».",
	'update.downloaderMissing':
		'Le programme de téléchargement (aria2c.exe) est introuvable, très probablement supprimé par votre antivirus. Restaurez-le depuis la quarantaine ou réinstallez le lanceur, puis cliquez sur « Réessayer ».',
	'launch.applying': 'Application…',
	'launch.updateAvailable': 'Mise à jour disponible !',
	'launch.modsChanged': 'Mods modifiés, appliquez-les avant de jouer',
	'launch.upToDate': 'Tout est à jour !',
	'launch.version': 'Version : {version}',
	'launch.errorLabel': 'Erreur :',
	'launch.serverFail': 'Impossible de joindre le serveur de mise à jour',
	'launch.localVersion': 'Vous pouvez lancer la version locale {version}',
	'launch.tryLater': 'Veuillez réessayer plus tard',
	'launch.verifyHint':
		'Vérifiez les données du jeu en cliquant sur « Réessayer ».',
	'launch.remaining': 'restantes',
	'launch.calculating': 'calcul en cours…',
	'launch.onDisk': 'sur le disque',
	'launch.blockedByAntivirus':
		"Votre antivirus a empêché le jeu de démarrer. Ajoutez le dossier du jeu en tant qu'exception (Paramètres, « Autoriser dans l'antivirus »), puis cliquez à nouveau sur « Jouer ».",
	'launch.updateFirst':
		'Une mise à jour du jeu est sortie pendant que le lanceur était ouvert. Laissez le lanceur terminer la vérification et la mise à jour, puis cliquez sur « Jouer ».',
	'tweaks.raidVisuals.label': 'Effets de raid améliorés',
	'tweaks.raidVisuals.text':
		"Téléchargement facultatif d'environ 9 Mo. Ajoute des marqueurs au sol et des sons plus clairs pour les techniques des boss de raid, synchronisés automatiquement avec le serveur. (alias Patch-O)",
	'tweaks.alwaysAutoLoot.label': 'Butin automatique permanent',
	'tweaks.alwaysAutoLoot.text':
		'Inverse le fonctionnement du butin automatique : il est toujours actif, et la touche associée le désactive.',
	'tweaks.largeAddress.label': 'Large Address Aware',
	'tweaks.largeAddress.text':
		"Permet au jeu d'utiliser plus de 2 Go de mémoire.",
	'tweaks.nameplateRange.label': 'Portée des barres de nom',
	'tweaks.nameplateRange.text':
		'Augmente la distance à laquelle les barres de nom sont visibles. [Vanilla : 20] [Classic : 41]',
	'tweaks.cameraHeading': 'Caméra',
	'tweaks.fieldOfView.label': 'Champ de vision',
	'tweaks.fieldOfView.text':
		'Recommandé pour les résolutions de fenêtre au format large. [Vanilla : 90] [Ajustements : 110]',
	'tweaks.farClip.label': "Distance d'affichage",
	'tweaks.farClip.text':
		"Augmente la distance d'affichage maximale. Des valeurs très élevées peuvent faire planter le jeu à l'entrée dans le monde. [Vanilla : 777]",
	'tweaks.farClip.recommendedHint': 'Recommandé pour votre PC : {value}.',
	'tweaks.frillDistance.label': 'Distance des détails du sol',
	'tweaks.frillDistance.text':
		"Modifie la distance d'affichage des détails du sol. [Vanilla : 70] [Ajustements : 300]",
	'tweaks.cameraDistance.label': 'Distance de la caméra',
	'tweaks.cameraDistance.text':
		'Augmente la distance maximale de la caméra (zoom arrière). [Vanilla : 50] [Maximum : 100]',
	'tweaks.soundsHeading': 'Sons',
	'tweaks.soundInBackground.label': 'Son en arrière-plan',
	'tweaks.soundInBackground.text':
		"Permet d'entendre les sons du jeu lorsqu'il est réduit.",
	'tweaks.applyFailed': "Impossible d'appliquer les ajustements : {message}",
	'tweaks.highlighted': 'Les options en surbrillance',
	'tweaks.recommendedNote': 'sont recommandées et activées par défaut',
	'tweaks.reset': 'Réinitialiser',
	'tweaks.apply': 'Appliquer',
	'mods.update': 'mise à jour',
	'mods.ignoreUpdates': 'Ignorer les mises à jour',
	'mods.ownFile': 'Votre propre fichier',
	'mods.ownFileHint':
		'Vous avez remplacé {files} par votre propre copie. Le lanceur la conserve et ne la modifie jamais, que ce mod soit coché ou non.',
	'mods.useLauncherVersion': 'Utiliser la version du lanceur',
	'mods.useLauncherVersionHint':
		"Remet en place la version du lanceur de {files}. Votre copie est remplacée et n'est pas conservée.",
	'mods.title': 'MODS PERSONNALISÉS',
	'mods.unsavedChanges': 'modifications non enregistrées',
	'mods.warning':
		"L'activation des mods personnalisés peut n'apporter aucun gain de performances, voire provoquer des plantages du jeu selon votre système. Essayez de les désactiver si vous rencontrez des problèmes.",
	'mods.enableRequired':
		'Activez {mods}, requis par les mods que vous avez sélectionnés.',
	'mods.depRequired': '{mod} doit être activé. Il est requis par {requiredBy}.',
	'mods.highlighted': 'Les mods en surbrillance',
	'mods.highlightedRecommended': 'sont recommandés.',
	'mods.apply': 'Appliquer',
	'mods.cantApplyYet': "IMPOSSIBLE D'APPLIQUER POUR L'INSTANT",
	'mods.close': 'Fermer',
	'av.blockedTitle': "BLOQUÉ PAR L'ANTIVIRUS",
	'av.blockedOne': 'Windows Defender a bloqué ce mod :',
	'av.blockedMany': 'Windows Defender a bloqué ces mods :',
	'av.blockedExplain':
		'Ce sont des mods communautaires sûrs que Defender signale à tort. Autorisez-les une fois, puis réessayez.',
	'av.whyHappening': 'Pourquoi cela se produit-il ?',
	'av.close': 'Fermer',
	'av.whyTitle': 'POURQUOI LES ANTIVIRUS SIGNALENT LES MODS',
	'av.whyIntro':
		"Certains des mods installés par le lanceur sont signalés par Windows Defender (ou un autre antivirus) comme une menace, par exemple « {detection} ». Il s'agit d'un",
	'av.falsePositive': 'faux positif',
	'av.whatSetsItOff': "Ce qui déclenche l'alerte",
	'av.whatSetsItOffIntro':
		"Ces mods modernisent le client du jeu en version 1.12, vieux de 20 ans, à l'aide de deux techniques qui paraissent suspectes aux analyses heuristiques des antivirus :",
	'av.dllInjection': 'Injection de DLL',
	'av.dllInjectionText':
		"les mods chargent du code supplémentaire dans le jeu en cours d'exécution pour ajouter des fonctionnalités (compensation du ping, meilleures barres de nom, performances). Charger du code dans un autre programme est aussi une pratique des logiciels malveillants, ce comportement suffit donc à déclencher une alerte.",
	'av.exePatching': "Patch de l'exécutable",
	'av.exePatchingText':
		"certains mods modifient WoW.exe pour lever d'anciennes limites du moteur (par exemple permettre au client 32 bits d'utiliser 4 Go de RAM au lieu de 2 Go). Modifier un exécutable est un autre comportement courant des logiciels malveillants.",
	'av.heuristicNote':
		"Comme il s'agit de détections basées sur le comportement et non de correspondances avec de vrais logiciels malveillants, les mods légitimes qui utilisent ces techniques sont signalés comme faux positifs génériques de type « trojan » ou « hacktool ».",
	'av.whatModsDo': 'Ce que font réellement les mods',
	'av.modVanillaFixes':
		'le chargeur qui corrige les saccades et les bugs de minuterie, et qui lance les autres mods.',
	'av.modNampower':
		'compensation du ping pour que les incantations restent réactives avec une latence élevée.',
	'av.modSuperWowUnitXp':
		'Lua avancé, vraies barres de nom, améliorations de la caméra et du ciblage.',
	'av.modDxvk':
		"traduit l'ancien DirectX 9 en Vulkan moderne pour un gain de FPS important.",
	'av.howToVerify': 'Comment vérifier ces affirmations',
	'av.howToVerifyText':
		"Ce sont des projets communautaires open source. Vous pouvez lire chaque ligne du code de chaque mod grâce au lien vers sa source, affiché à côté de lui dans la liste de l'onglet Mods, et vous pouvez rechercher le nom de la détection (par exemple « {detection} ») pour constater qu'il s'agit d'un faux positif documenté pour ces outils.",
	'av.back': 'Retour',
	'addons.sectionInstalled': 'Installés',
	'addons.sectionRecommended': 'Recommandés',
	'addons.sectionAvailable': 'Disponibles',
	'addons.checkForUpdates': 'Rechercher des mises à jour',
	'addons.addCustomGitAddon': 'Ajouter un AddOn git personnalisé',
	'addons.updateAll': 'Tout mettre à jour',
	'addons.everythingUpToDate': 'Tout est à jour.',
	'addons.installAddon': 'Installer un AddOn',
	'addons.previewAlt': 'Aperçu',
	'addons.readyToInstall': 'Prêt à être installé',
	'addons.invalidGitUrl': 'URL de dépôt git non valide',
	'addons.install': 'Installer',
	'addons.warnIncorrectVersionFull':
		'Cet AddOn semble conçu pour une autre version du jeu ({version}) et risque de ne pas fonctionner correctement',
	'addons.warnIncorrectVersionShort': 'Version incorrecte',
	'addons.warnMissingDependenciesFull':
		'Il manque des dépendances à cet AddOn : {deps}',
	'addons.warnMissingDependenciesShort': 'Dépendances manquantes',
	'addons.details': 'Détails',
	'addons.openOnGithub': 'Ouvrir {url} sur GitHub',
	'addons.upToDate': 'À jour',
	'addons.notVersioned': 'Sans version',
	'addons.update': 'Mettre à jour',
	'addons.ownCopy': 'Votre propre copie',
	'addons.ownCopyHint':
		"Cette copie de {name} n'a pas été installée par le lanceur, elle vous appartient donc. Le lanceur la conserve et ne la met pas à jour.",
	'addons.useLauncherVersion': 'Utiliser la version du lanceur',
	'addons.useLauncherVersionHint':
		"Installe la version du lanceur de cet AddOn. Votre copie est remplacée et n'est pas conservée.",
	'addons.edited': 'Modifié',
	'addons.editedHint':
		'Vous avez modifié des fichiers de cet AddOn. Une mise à jour écrase vos modifications.',
	'addons.download': 'Télécharger',
	'addons.deleteConfirmTitle': 'Êtes-vous sûr ?',
	'addons.deleteConfirmBody':
		"Voulez-vous vraiment supprimer l'AddOn {folder} ?",
	'addons.deleteConfirmFiles':
		"Tous les fichiers du dossier de l'AddOn seront supprimés.",
	'addons.delete': 'Supprimer',
	'addons.remove': 'Retirer',
	'addons.detailSource': 'Source',
	'addons.openOnGithubShort': 'Ouvrir sur GitHub',
	'addons.detailContributions': 'Contributions',
	'addons.detailAddonVersion': "Version de l'AddOn",
	'addons.detailDependencies': 'Dépendances',
	'addons.optional': '(facultatif)',
	'prefs.mirrorOffline': 'hors ligne',
	'prefs.mirrorChecking': 'vérification…',
	'prefs.mirrorOnline': 'en ligne',
	'prefs.title': 'PARAMÈTRES',
	'prefs.installLocation': "EMPLACEMENT D'INSTALLATION :",
	'prefs.openFolder': 'Ouvrir le dossier',
	'prefs.notSelected': 'Non sélectionné',
	'prefs.change': 'Modifier',
	'prefs.downloadMirror': 'MIROIR DE TÉLÉCHARGEMENT :',
	'prefs.recheck': 'Vérifier à nouveau',
	'prefs.troubleshooting': 'DÉPANNAGE :',
	'prefs.verifyGameFiles': 'Vérifier les fichiers du jeu',
	'prefs.openLogFile': 'Ouvrir le fichier journal',
	'prefs.allowThroughAntivirus': "Autoriser dans l'antivirus",
	'prefs.generalSettings': 'PARAMÈTRES GÉNÉRAUX :',
	'prefs.cleanWdb': 'Vider le dossier WDB à chaque lancement',
	'prefs.minimizeToTray': 'Réduire dans la zone de notification pendant le jeu',
	'prefs.proton': 'PROTON :',
	'prefs.useProton': 'Lancer le jeu avec Proton',
	'prefs.protonVersion': 'Version de Proton',
	'prefs.protonNone':
		'Aucun Proton trouvé. Installez Proton via Steam ou placez GE-Proton dans le dossier compatibilitytools.d de Steam.',
	'launch.protonMissing':
		'La version de Proton choisie dans les Paramètres est introuvable. Choisissez-en une autre ou désactivez Proton, puis cliquez à nouveau sur « Jouer ».',
	'prefs.save': 'Enregistrer',
	'prefs.installLocationTitle': "Emplacement d'installation",
	'prefs.portableInfo':
		"Vous utilisez la version portable du lanceur. L'emplacement d'installation est déterminé par celui de l'exécutable du lanceur.",
	'prefs.errorLabel': 'Erreur : ',
	'prefs.wowExeNotFound':
		'{exe} introuvable dans le dossier actuel. Veuillez fermer le lanceur et le déplacer dans le dossier de votre client WoW 1.12.',
	'prefs.selectDirectory':
		"Sélectionnez un dossier pour l'installation du client du jeu.",
	'prefs.upgradeExisting':
		'Vous pouvez aussi choisir un dossier contenant une installation existante de Turtle WoW ou de Vanilla WoW, qui sera alors mise à niveau automatiquement.',
	'prefs.installDirectory': "Dossier d'installation :",
	'prefs.noClientHere':
		'Aucun {exe} dans ce dossier. Le lanceur va télécharger ici un nouveau client, qui ne contiendra ni vos AddOns ni vos paramètres actuels. Si vous avez déjà une installation, choisissez plutôt son dossier.',
	'prefs.noClientHereConfirm':
		"J'ai compris : télécharger un nouveau client dans ce dossier",
	'prefs.confirm': 'Confirmer',
	'misc.newsByAuthor': 'par {author}',
	'misc.newsReadMore': 'Lire la suite',
	'misc.refresh': 'Actualiser',
	'misc.newsLoading': 'Chargement des actualités…',
	'misc.newsError': "Impossible d'accéder au flux d'actualités.",
	'misc.newsEmpty': 'Aucune actualité pour le moment. Revenez plus tard.',
	'misc.tryAgain': 'Réessayer',
	'misc.comingSoon': 'Bientôt disponible…',
	'misc.selfUpdateCheckFailed': 'Échec de la recherche de mises à jour',
	'misc.selfUpdateAvailable':
		'Mise à jour du lanceur {version} disponible, préparation du téléchargement…',
	'misc.selfUpdateDownloading':
		'Téléchargement de la mise à jour {version} · {percent} %',
	'misc.selfUpdateReady':
		'Mise à jour du lanceur {version} prête à être installée',
	'misc.selfUpdateInstallNow': 'Installer maintenant',
	'misc.tabCrashed': "L'onglet {tab} a planté",
	'misc.somethingWentWrong': "Une erreur s'est produite !",
	'misc.uncaughtError': '{name} non interceptée : {message}',
	'misc.unknownError': 'Erreur inconnue',
	'misc.copyError': "Copier l'erreur",
	'misc.reload': 'Recharger',
	'misc.announcementsTitle': 'Annonces',
	'misc.patchNotesTitle': 'Notes de mise à jour',
	'misc.close': 'Fermer',
	'misc.pickFile': 'Parcourir…',
	'mods.missingFiles':
		"Fichiers du jeu manquants pour : {mods}. Resynchronisez votre client pour les restaurer. Si votre antivirus les bloque, autorisez-les d'abord.",
	'mods.reverify': 'Resynchroniser le client',
	'mods.yourDlls': 'Vos mods DLL',
	'mods.yourDllsEmpty':
		"Déposez un fichier .dll dans le dossier du jeu, ou utilisez « Ajouter une DLL », pour l'activer ou le désactiver ici.",
	'mods.addDll': 'Ajouter une DLL',
	'mods.addDllTitle': 'Choisir un mod DLL',
	'mods.addDllFailed': "Impossible d'ajouter la DLL.",
	'mods.applied': 'Appliqué',
	'av.howToAllowTitle': "Comment autoriser les mods dans l'antivirus",
	'av.guideIntro':
		"Le lanceur ne modifie pas lui-même les paramètres de votre antivirus, car Windows Defender considère les applications qui le font comme des logiciels malveillants. Ajouter vous-même l'exclusion dans Sécurité Windows ne prend qu'un instant.",
	'av.step1':
		"1. Ouvrez Sécurité Windows, faites défiler jusqu'à Exclusions et choisissez « Ajouter ou supprimer des exclusions », puis « Ajouter une exclusion » > « Dossier », et ajoutez chacun de ces dossiers :",
	'av.openWindowsSecurity': 'Ouvrir Sécurité Windows',
	'av.openFailed':
		"L'application Sécurité Windows ne s'est pas ouverte. Recherchez-la dans le menu Démarrer, puis accédez à Protection contre les virus et menaces > Gérer les paramètres > Ajouter ou supprimer des exclusions.",
	'av.copy': 'Copier',
	'av.copied': 'Copié',
	'av.step2': '2. Restaurez ensuite les fichiers supprimés par Defender :',
	'av.restoreFiles': 'Restaurer les fichiers bloqués',
	'av.checkAgain': 'Vérifier à nouveau',
	'av.allClear': "Plus rien n'est bloqué. Vous pouvez jouer.",
	'av.checking': 'Vérification…',
	'av.checkStillBlocked':
		'Fichiers toujours bloqués : {files}. Assurez-vous que les deux dossiers figurent dans la liste des exclusions, puis utilisez « Restaurer les fichiers bloqués ».',
	'av.checkFailed':
		'Impossible de vérifier pour le moment. Veuillez réessayer dans un instant.',
	'av.restoring':
		'Restauration des fichiers en cours. Cela peut prendre une minute.',
	'av.restoreDoneFiles':
		"Fichiers restaurés : {files}. Plus rien n'est bloqué. Vous pouvez jouer.",
	'av.restorePartial':
		'Fichiers restaurés : {restored}. En revanche, ceux-ci sont toujours bloqués : {files}. Vérifiez que les deux dossiers figurent dans la liste des exclusions, puis réessayez.',
	'av.restoreNone':
		"Ces fichiers sont toujours bloqués : {files}. Vérifiez que les deux dossiers figurent dans la liste des exclusions, puis réessayez. S'ils restent bloqués, restaurez-les dans Sécurité Windows, sous Historique de protection.",
	'av.restoreNoClient': "Définissez d'abord le dossier du jeu, puis réessayez.",
	'av.restoreGameRunning': "Fermez d'abord le jeu, puis réessayez.",
	'av.restoreBusy':
		"Le lanceur est déjà en train de mettre à jour le jeu. Attendez qu'il ait terminé, puis réessayez.",
	'av.restoreServer':
		'Impossible de joindre le serveur de téléchargement. Veuillez réessayer dans quelques minutes.',
	'av.restoreIncomplete':
		"Certains fichiers n'ont pas encore pu être téléchargés. Veuillez réessayer dans quelques minutes.",
	'av.restoreFailed':
		"Les fichiers n'ont pas pu être restaurés. Veuillez réessayer ou utiliser « Vérifier les fichiers du jeu » dans les Paramètres.",
	'av.howToAllowText':
		"Dans Sécurité Windows, accédez à Protection contre les virus et menaces > Gérer les paramètres > Ajouter ou supprimer des exclusions, et ajoutez le dossier du jeu et le dossier du lanceur en tant qu'exclusions de type Dossier. Defender cesse alors d'analyser et de supprimer les fichiers des mods dans ces deux dossiers. Utilisez ensuite « Restaurer les fichiers bloqués » (ou « Vérifier les fichiers du jeu » dans les Paramètres) pour récupérer tout ce qu'il a déjà supprimé.",
	'av.howToAllowSafety':
		"Le lanceur ne le fait pas à votre place, et c'est volontaire : les applications qui modifient d'elles-mêmes les paramètres de l'antivirus ressemblent à des logiciels malveillants aux yeux de Windows Defender. Ajouter vous-même l'exclusion est la méthode sûre, et vous pouvez la supprimer à tout moment depuis le même écran.",
	'prefs.shareDownloads':
		'Participer au partage des téléchargements avec les autres joueurs',
	'priority.active': 'Connexion prioritaire active',
	'priority.signOut': 'Se déconnecter',
	'priority.signIn': "S'identifier pour la connexion prioritaire",
	'priority.tryAgain': 'Réessayer la connexion prioritaire',
	'priority.finishInBrowser':
		"Terminez l'identification dans votre navigateur web, puis revenez ici.",
	'priority.standardLogin': 'Utilisation de la connexion standard.',
	'priority.accountTooNew':
		'Votre compte doit exister depuis au moins 24 heures pour utiliser la connexion prioritaire.',
	'priority.notGoodStanding':
		"Ce compte n'est pas éligible à la connexion prioritaire.",
	'priority.emailUnverified':
		'Vérifiez votre adresse e-mail pour utiliser la connexion prioritaire.',
	'priority.hostingOrVpn':
		"La connexion prioritaire n'est pas disponible via un VPN ou le réseau d'un hébergeur. Veuillez vous connecter depuis votre réseau domestique.",
	'priority.sharedVpnIp':
		'Un autre compte utilise déjà la connexion prioritaire via ce VPN. Changez de réseau ou utilisez la connexion standard.',
	'priority.notOnThisConnection':
		"La connexion prioritaire n'est pas disponible avec cette connexion Internet.",
	'priority.noCharacter':
		"Jouez d'abord avec votre compte pour débloquer la connexion prioritaire.",
	'priority.notInRollout':
		"La connexion prioritaire n'est pas encore activée pour votre compte. Utilisation de la connexion standard.",
	'priority.notAvailableNow':
		"La connexion prioritaire n'est pas disponible pour le moment. Utilisation de la connexion standard."
};

export const translations: Record<Lang, Dict> = {
	enUS,
	deDE,
	zhCN,
	esES,
	ptBR,
	ruRU,
	koKR,
	frFR
};
