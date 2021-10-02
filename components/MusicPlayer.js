import Slider from "@react-native-community/slider";
import React, { useEffect, useRef, useState } from "react";
import {View, Text, StyleSheet, SafeAreaView, Dimensions, TouchableOpacity, FlatList, Animated} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import songs from "../model/data";
import TrackPlayer, {Capability,Event,RepeatMode,State,usePlaybackState,useProgress,useTrackPlayerEvents} from "react-native-track-player";
import songs from "../model/songs";

const {width, height} = Dimensions.get("window")
const setupPlayer = async() =>{
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
        capabilities:[
            Capability.Play,
            Capability.Pause,
            Capability.SkipToNext,
            Capability.SkipToPrevious,
            Capability.Stop,
        ]
    })
    await TrackPlayer.add();
};
const togglePlayback = async(playbackState)=>{
    const currentTrack = await TrackPlayer.getCurrentTrack();

    if (currentTrack =! null){
        if(playbackState== State.Paused) {
            await TrackPlayer.play();
        } else {
            await TrackPlayer.pause();
        }
    }
}

const MusicPlayer = () =>{
    const playbackState = usePlaybackState();
    const  progress = useProgress();
    const [trackArtWork, setTrackArtWork] = useState();
    const [trackArtist, setTrackArtist] = useState();
    const [trackTitle, setTrackTitle] = useState();

    const scrollX = useRef(new Animated.Value(0)).current;
    const [songIndex, setSongIndex] = useState(0);
    const [repeatMode, setRepeatMode] = useState("off");
    const songSlider = useRef(null);
    
    useTrackPlayerEvents([Event.PlaybackTrackChanged], async event =>{
        if(event.type === Event.PlaybackTrackChanged && event.nextTrack != null){
            const track = await TrackPlayer.getTrack(event.nextTrack);
            const {title, artwork, artist } = track;
            setTrackArtWork(artwork);
            setTrackArtist(artist);
            setTrackTitle(title);
        }
    })

    const repeatIcon = ()=>{
        if(repeatMode == "off"){
            return "repeat-off"
        }
        if(repeatMode == "track"){
            return "repeat-once"
        }
        if(repeatMode == "repeat"){
            return "repeat"
        }
    }
    const changerepeatMode= () => {
        if(repeatMode== "off"){
            TrackPlayer.setRepeatMode(RepeatMode.Track);
            setRepeatMode("track");
        }
        if(repeatMode== "track"){
            TrackPlayer.setRepeatMode(RepeatMode.Queue);
            setRepeatMode("repeat");
        }
        if(repeatMode== "repeat"){
            TrackPlayer.setRepeatMode(RepeatMode.Off);
            setRepeatMode("off");
        }
    }

    const skipTo = async (trackId) =>{
       await TrackPlayer.skip(trackId);
    }
    useEffect(()=>{
        setupPlayer();

        scrollX.addListener(({value}) =>{
            const index = Math.round(value/width);
            skipTo(index);
            setSongIndex(index);
        });
        return () =>{
            scrollX.removeAllListeners();
        }

    }, []);

    const skipToNext = () =>{
        songSlider.current.scrollToOffset({
            offset : (songIndex + 1)* width,
        });
    };
    const skipToPrevious = () =>{
        songSlider.current.scrollToOffset({
            offset : (songIndex - 1)* width,
        });
    };
    const renderSongs=(index, item) =>{
        return(
            <Animated.View style={{width:width, justifyContent:'center',alignItems:"center"}}>
                <View style={styles.artwork}>
                     <Image source={trackArtWork} style={styles.artworkimage}/>
                </View>
            </Animated.View>
        );
    };

    return(
        <SafeAreaView style={styles.container}> 
        <View style={styles.maincontainer}>
        <View style={{width:width}}>
        <Animated.FlatList 
            ref={songSlider}
            renderItem={renderSongs} 
            data={songs}
            keyExtractor={(item)=>item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            scrollEventThrottle={16}
            onScroll={Animated.event(
                [{ nativeEvent: {
                    contentOffset :{x:scrollX}
                     }
                }],
                {useNativeDriver:true}
            )}
        />
        </View>
        <View>
            <Text style={styles.title}>{trackTitle} </Text>
            <Text style={styles.artist}>{trackArtist}</Text>
        </View>

        <View>
            <Slider
                style={styles.sliderwrapper}
                value={progress.position}
                minimumValue={0}
                maximumValue={progress.duration}
                thumbTintColor="#FFD369"
                maximumTrackTintColor="#FFF"
                minimumTrackTintColor="#FFD369"
                onSlidingComplete={async(value)=>{
                    await TrackPlayer.seekTo(value);
                }}
            />
        </View>

        <View style={styles.labelcontainer}>
            <Text style={styles.labeltext}>
                {new Date(progress.position * 1000).toISOString().substr(14, 5)}
            </Text>
            <Text style={styles.labeltext}>
            {new Date((progress.duration - progress.position) * 1000).toISOString().substr(14, 5)}
            </Text>
        </View>

        <View style={styles.musiccontrols}>
            <TouchableOpacity onPress={skipToNext}>
                <Ionicons name="play-skip-back-outline" size={35} color="#FFD369" style={{marginTop:25}} />
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>togglePlayback(playbackState)}>
                <Ionicons name={playbackState == State.Playing ? "ios-pause-circle": "ios-play-circle"} size={75} color="#FFD369" />
            </TouchableOpacity>
            <TouchableOpacity onPress={skipToPrevious}>
                <Ionicons name="play-skip-forward-outline" size={35} color="#FFD369" style={{marginTop:25}} />
            </TouchableOpacity>
        </View>

        <View style={styles.bottomcontainer}>
           <View style={styles.bottomcontrols}>
               <TouchableOpacity onPress={()=>{}}>
                <Ionicons name="heart-outline" size={30} color="#777777" />
                </TouchableOpacity>
                <TouchableOpacity onPress={changerepeatMode}>
                <MaterialCommunityIcons name={`${repeatIcon()}`} size={30} color={repeatMode != "off" ? "#FFD369":"#777777" } />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{}}>
                <Ionicons name="share-outline" size={30} color="#777777" />
                </TouchableOpacity>
                <TouchableOpacity onPress={()=>{}}>
                <Ionicons name="ellipsis-horizontal" size={30} color="#777777" />
                </TouchableOpacity>
            </View>
        </View>
        </View>
        </SafeAreaView>
    );
};

export default MusicPlayer;
const styles = StyleSheet.create({
    maincontainer:{
        flex:1,
        backgroundColor:"#222831"
    },
    container:{
        flex:1,
        alignItems:"center",
        justifyContent:"center"
    },
    artwork:{
        width:300,
        height:340,
        marginBottom:25,

        shadowColor:"#ccc",
        shadowOffset:{
            width:5,
            height:5,
        },
        shadowOpacity:0.5,
        shadowRadius:3.84,

        elevation:5
    },
    artworkimage:{
        width:"100%",
        height:"100%",
        borderRadius:15
    },
    title:{
        fontSize:18,
        fontWeight:'600',
        textAlign:"center",
        color:"#EEEEEE"
    },
    artist:{
        fontSize:16,
        fontWeight:"200",
        textAlign:"center",
        color:"#EEEEEE"
    },
    sliderwrapper:{
        width:350,
        height:40,
        marginTop:25,
        flexDirection:"row"
    },
    labelcontainer:{
        width:340,
        flexDirection:"row",
        justifyContent:"space-between"
    },
    labeltext:{
        color:"#fffs"
    },
    musiccontrols:{
        flexDirection:'row',
        justifyContent:"space-between",
        width:"60%",
        marginTop:15    },
    bottomcontainer:{
        borderTopColor:"#393E46",
        borderTopWidth:1,
        width:width, 
        alignItems:"center", 
        paddingVertical:15
    },
    bottomcontrols:{
        flexDirection:"row",
        justifyContent:"space-around",
        width:"80%"
    },
    
})