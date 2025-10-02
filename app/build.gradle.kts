plugins {
    application
    id("com.github.johnrengelman.shadow") version "8.1.1"
}

repositories{
    mavenCentral()
}

dependencies {
    implementation(project(":fastcgi-lib"))
}

tasks.jar {
    archiveFileName.set("server.jar")

    manifest {
        attributes["Main-Class"] = "ru.itmo.se.web.fastcgi.Server"
        attributes["Class-Path"] = "fastcgi-lib.jar"
    }
}

application {
    mainClass.set("ru.itmo.se.web.fastcgi.Server")
}
