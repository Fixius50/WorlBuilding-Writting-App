@echo off 
:START 
call mvnw.cmd clean spring-boot:run 
if exist restart.flag ( 
    del restart.flag 
    timeout /t 2 /nobreak >nul 
    goto START 
) 
pause 
