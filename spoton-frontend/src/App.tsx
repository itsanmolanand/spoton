/** Copyright Anmol Anand **/
import { AppShell, ActionIcon, List, ColorSchemeProvider, ColorScheme, DEFAULT_THEME, LoadingOverlay, useMantineColorScheme, Burger, Button, Container, Footer, Header, MantineProvider, MediaQuery, Paper, Stack, Text, TextInput, TypographyStylesProvider, createStyles, rem, useMantineTheme } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useCallback, useEffect, useState } from 'react';
import { fetchSongs } from './Services/Recommendations';
import { IconSun, IconMoonStars } from '@tabler/icons-react';

const useStyles = createStyles(() => ({
  centerBlock: {
    textAlign: 'center',
    color: 'red',
    fontWeight: 'bolder'
  },

  headerBlock: {
    textAlign: 'center',
    color: '#1DB954',
    fontWeight: 'bold'
  }
}));

export default function App() {
  const [visible, setVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [opened, setOpened] = useState(false);
  const [songData, setSongData] = useState([])

  const [colorScheme, setColorScheme] = useState<ColorScheme>('light');
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  const theme = useMantineTheme();
  const dark = colorScheme === 'dark';

  const form = useForm({
    initialValues: {
      track: '',
      artist: '',
    },

  });

  const topTracks = [
    { display: 'Cruel Summer, Taylor Swift', track: 'Cruel Summer', artist: 'Taylor Swift' },
    { display: 'Self Love, Metro Boomin', track: 'Self Love (Spider-Man: Across the Spider-Verse) (Metro Boomin & Coi Leray)', artist: 'Metro Boomin' },
    { display: 'Dance The Night, Dua Lipa', track: 'Dance The Night (From Barbie The Album)', artist: 'Dua Lipa' },
    { display: 'CUFF IT, Beyoncé', track: 'CUFF IT', artist: 'Beyoncé' },
    { display: 'Olivia Rodrigo, Vampire', track: 'Vampire', artist: 'Olivia Rodrigo' },
    { display: 'Dial Drunk, Noah Kahan', track: 'Dial Drunk', artist: 'Noah Kahan' },
    { display: 'Take Two, BTS', track: 'Take Two', artist: 'BTS' },
    { display: 'See You Again, Tyler, The Creator', track: 'See You Again (feat. Kali Uchis)', artist: 'Tyler, The Creator' },
    { display: 'Sure Thing, Miguel', track: 'Sure Thing', artist: 'Miguel' },
    { display: 'Snooze, SZA', track: 'Snooze', artist: 'SZA' },
    { display: 'Princess Diana, Ice Spice', track: 'Princess Diana (with Nicki Minaj)', artist: 'Ice Spice' },
    { display: 'Flowers, Miley Cyrus', track: 'Flowers', artist: 'Miley Cyrus' },
    { display: 'Area Codes, Kaliii', track: 'Area Codes', artist: 'Kaliii' },
    { display: 'Waffle House, Jonas Brothers', track: 'Waffle House', artist: 'Jonas Brothers' },
    { display: 'Harry Styles, As It Was', track: 'As It Was', artist: 'Harry Styles' },
  ];

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  useEffect(() => {
    shuffleArray(topTracks);
    console.log('shuffling')
  }, [])

  const generateList = (): JSX.Element => {
    if (refresh) {
      shuffleArray(topTracks);
    }

    const items: JSX.Element[] = [];
    topTracks.slice(0, 5).forEach((elem) => {
      items.push(
        <List.Item>
          <a href="#" onClick={() => execSearch(elem.track, elem.artist)}>{elem.display}</a>
        </List.Item>
      );
    });

    return (<List>{items}</List>);
  };

  const { classes } = useStyles();

  const loadSongData = useCallback(async (values) => {
    setVisible(true);
    setSongData(await fetchSongs(values.track, values.artist));
    setVisible(false);
    setRefresh(true);
  }, [])

  const updateSongs = () => {
    loadSongData(form.values)
  };

  const execSearch = (track: string, artist: string) => {
    setRefresh(false);
    form.setValues({
      track: track,
      artist: artist
    });
  }

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
        <TypographyStylesProvider>
          <AppShell
            styles={{
              main: {
                background: colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[3],
              },
            }}
            navbarOffsetBreakpoint="sm"
            asideOffsetBreakpoint="sm"
            footer={
              <Footer height={60} p="md">
                <Container size="28rem">
                  <Text> Copyright &copy; 2023, Anmol Anand. All Rights Reservered </Text>
                </Container>
              </Footer>
            }
            header={
              <Header height={{ base: 50, md: 70 }} p="md">
                <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
                  <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                    <Burger
                      opened={opened}
                      onClick={() => setOpened((o) => !o)}
                      size="sm"
                      color={theme.colors.gray[6]}
                      mr="xl"
                    />
                  </MediaQuery>
                  <Container size="100rem">
                    <Text> <b>Song Recommendations </b></Text>
                  </Container>
                  <Container size="1rem">
                    <ActionIcon
                      variant="outline"
                      color={dark ? 'yellow' : 'blue'}
                      onClick={() => toggleColorScheme()}
                      title="Toggle color scheme"
                    >
                      {dark ? <IconSun size="1.1rem" /> : <IconMoonStars size="1.1rem" />}
                    </ActionIcon>
                  </Container>
                </div>
              </Header>
            }
          >
            <Container size="50rem">
              <div className={classes.headerBlock}>
              Find recommendations for your favorite songs by typing it in the box or clicking on one of the songs below.
              </div>
            </Container>
            <Container size="md" px="xs">
              <Paper radius="md" p="xl" withBorder>
                <form onSubmit={form.onSubmit(() => { })}>
                  <Stack>
                    <TextInput
                      required
                      label="Track"
                      placeholder="Ex. Lavender Haze"
                      value={form.values.track}
                      onChange={(event) => form.setFieldValue('track', event.currentTarget.value)}
                      error={form.errors.track && 'Invalid track'}
                      radius="md"
                    />

                    <TextInput
                      required
                      label="Artist"
                      placeholder="Ex. Taylor Swift"
                      value={form.values.artist}
                      onChange={(event) => form.setFieldValue('artist', event.currentTarget.value)}
                      error={form.errors.artist && 'Invalid artist'}
                      radius="md"
                    />
                  </Stack>

                  <Container size="15rem" py='xl' styles="display:flex;justify-content:right;">
                    <Button type="submit" color="lime" radius="md" onClick={updateSongs}>
                      Get Recommendations
                    </Button>
                  </Container>
                </form>
                <Container size="42rem" py='xl'>
                  <LoadingOverlay visible={visible} overlayBlur={2} />
                  {<div>
                    {songData[0] == 'error' ?
                      <div className={classes.centerBlock}>
                        Invalid input or no songs matched
                      </div>
                      : songData.map((element) => (
                        <iframe
                          key={element}
                          style={{ borderRadius: '12px', border: 0, height: '100px', padding: '10px' }}
                          src={`https://open.spotify.com/embed/track/${element}?utm_source=generator`}
                          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                          loading="lazy"
                        ></iframe>
                      ))}
                    {generateList()}
                  </div>}
                </Container>
              </Paper>
            </Container>
          </AppShell>
        </TypographyStylesProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
